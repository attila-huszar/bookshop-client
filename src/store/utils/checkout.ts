import { HTTPError, TimeoutError } from 'ky'
import { hasStringError } from '@/helpers'
import {
  ORDER_SYNC_RETRY_BASE_DELAY_MS,
  ORDER_SYNC_RETRY_MAX_DELAY_MS,
  retryableHttpStatuses,
  timeoutHttpStatuses,
} from '@/constants'
import type { OrderSyncIssueCode } from '@/types'

const getOrderSyncIssueCode = (status: number): OrderSyncIssueCode => {
  if (status === 401 || status === 403) return 'unauthorized'
  if (timeoutHttpStatuses.has(status)) return 'timeout'
  if (retryableHttpStatuses.has(status)) return 'retryable'
  return 'unknown'
}

export const getOrderSyncRetryDelay = (attempt: number): number => {
  const exponentialDelay =
    ORDER_SYNC_RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1)
  return Math.min(exponentialDelay, ORDER_SYNC_RETRY_MAX_DELAY_MS)
}

export const parseOrderSyncError = async (
  error: unknown,
): Promise<{
  message: string
  code: OrderSyncIssueCode
  retryable: boolean
}> => {
  if (error instanceof TimeoutError) {
    return {
      message: 'Order sync request timed out',
      code: 'timeout',
      retryable: true,
    }
  }

  if (error instanceof TypeError) {
    return {
      message: error.message || 'Network error while syncing order status',
      code: 'retryable',
      retryable: true,
    }
  }

  if (error instanceof HTTPError) {
    const { response, message: fallbackMessage } = error
    const { status } = response

    const apiMessage = await response
      .json<unknown>()
      .then((payload) => (hasStringError(payload) ? payload.error : null))
      .catch(() => null)

    return {
      message: apiMessage ?? fallbackMessage,
      code: getOrderSyncIssueCode(status),
      retryable: retryableHttpStatuses.has(status),
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    code: 'unknown',
    retryable: false,
  }
}
