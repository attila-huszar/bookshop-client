import { HTTPError, TimeoutError } from 'ky'
import {
  ORDER_SYNC_RETRY_BASE_DELAY_MS,
  ORDER_SYNC_RETRY_MAX_DELAY_MS,
  RETRYABLE_STATUS_CODES,
  TIMEOUT_STATUS_CODES,
  UNAUTHORIZED_STATUS_CODES,
} from '@/constants'
import type { OrderSyncIssueCode } from '@/types'

const getOrderSyncIssueCode = (status: number): OrderSyncIssueCode => {
  if (UNAUTHORIZED_STATUS_CODES.includes(status)) return 'unauthorized'
  if (TIMEOUT_STATUS_CODES.includes(status)) return 'timeout'
  if (RETRYABLE_STATUS_CODES.includes(status)) return 'retryable'
  return 'unknown'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const extractJsonMessage = (text: string): string | null => {
  const trimmedText = text.trim()
  if (!trimmedText) return null

  try {
    const parsed: unknown = JSON.parse(trimmedText)
    if (!isRecord(parsed)) return trimmedText

    for (const key of ['error', 'message', 'detail']) {
      const value = parsed[key]
      if (typeof value === 'string' && value.trim()) return value
    }

    return trimmedText
  } catch {
    return trimmedText
  }
}

const extractHttpErrorMessage = async (
  response: Response,
): Promise<string | null> => {
  try {
    const text = await response.clone().text()
    return extractJsonMessage(text)
  } catch {
    return null
  }
}

export const getOrderSyncRetryDelay = (attempt: number): number => {
  const exponential =
    ORDER_SYNC_RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1)

  const cappedDelay = Math.min(exponential, ORDER_SYNC_RETRY_MAX_DELAY_MS)

  const jitter = cappedDelay * 0.2 * Math.random()

  return cappedDelay + jitter
}

export const parseOrderSyncError = async (
  error: unknown,
): Promise<{
  message: string
  code: OrderSyncIssueCode
}> => {
  if (error instanceof TimeoutError) {
    return {
      message: 'Order sync request timed out',
      code: 'timeout',
    }
  }

  if (error instanceof TypeError) {
    return {
      message: error.message || 'Network error while syncing order status',
      code: 'retryable',
    }
  }

  if (error instanceof HTTPError) {
    const { response, message: fallback } = error
    const apiMessage = await extractHttpErrorMessage(response)

    return {
      message: apiMessage ?? fallback,
      code: getOrderSyncIssueCode(response.status),
    }
  }

  return {
    message:
      error instanceof Error && error.message ? error.message : 'Unknown error',
    code: 'unknown',
  }
}
