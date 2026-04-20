import { isHTTPError, isNetworkError, isTimeoutError } from 'ky'
import { log } from '@/services'
import {
  ORDER_SYNC_RETRY_BASE_DELAY_MS,
  ORDER_SYNC_RETRY_MAX_DELAY_MS,
  RETRYABLE_STATUS_CODES,
  TIMEOUT_STATUS_CODES,
  UNAUTHORIZED_STATUS_CODES,
} from '@/constants'
import type { OrderSyncIssueCode } from '@/types'

type ErrorResponse = {
  error?: string
  validation?: {
    fieldErrors: Record<string, string[]>
    formErrors: string[]
  }
}

export type ErrorClassification = {
  kind: 'http-validation' | 'http-server' | 'http' | 'error' | 'unknown'
  message: string
  status?: number
  validation?: ErrorResponse['validation']
}

const DEFAULT_ERROR_MESSAGE = 'Unknown error occurred'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const extractDataMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string' && data.trim()) return data
  if (!isRecord(data)) return undefined

  for (const key of ['message', 'detail']) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

const classifyError = (
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): ErrorClassification => {
  if (isHTTPError<ErrorResponse>(error)) {
    const response = typeof error.data !== 'string' ? error.data : undefined
    const status = error.response.status
    const validation = response?.validation

    const fieldErrors = isRecord(validation?.fieldErrors)
      ? Object.values(validation.fieldErrors).flatMap((value) =>
          Array.isArray(value)
            ? value.filter(
                (message): message is string =>
                  typeof message === 'string' && message.trim().length > 0,
              )
            : [],
        )
      : []
    const formErrors = Array.isArray(validation?.formErrors)
      ? validation.formErrors.filter(
          (message): message is string =>
            typeof message === 'string' && message.trim().length > 0,
        )
      : []
    const validationMessages = [...fieldErrors, ...formErrors]

    if (validationMessages.length > 0) {
      return {
        kind: 'http-validation',
        message: validationMessages.join(', ') || fallback,
        status,
        validation,
      }
    }

    const serverMessage =
      typeof response?.error === 'string' && response.error.trim()
        ? response.error
        : undefined

    return {
      kind: serverMessage ? 'http-server' : 'http',
      message:
        serverMessage ??
        extractDataMessage(error.data) ??
        error.message ??
        fallback,
      status,
    }
  }

  return {
    kind: error instanceof Error ? 'error' : 'unknown',
    message:
      error instanceof Error && error.message
        ? error.message
        : isRecord(error) && typeof error.message === 'string' && error.message
          ? error.message
          : fallback,
  }
}

export function handleError({
  error,
  message = DEFAULT_ERROR_MESSAGE,
}: {
  error: unknown
  message?: string
}): Error {
  const classified = classifyError(error, message)

  if (classified.kind === 'http-validation') {
    void log.warn('Validation error', {
      error: classified.validation,
      status: classified.status,
    })
  } else if (classified.kind === 'http-server') {
    void log.warn('Server error', {
      error: classified.message,
      status: classified.status,
    })
  } else if (classified.kind === 'http') {
    void log.warn('HTTP error', {
      error: classified.message,
      status: classified.status,
    })
  } else {
    void log.error(
      error instanceof Error ? 'Generic JS error' : 'Unknown error',
      { error },
    )
  }

  return new Error(classified.message)
}

export const parseOrderSyncError = (
  error: unknown,
): {
  message: string
  code: OrderSyncIssueCode
} => {
  if (isTimeoutError(error)) {
    return {
      message: 'Order sync request timed out',
      code: 'timeout',
    }
  }

  if (isNetworkError(error)) {
    return {
      message: error.message || 'Network error while syncing order status',
      code: 'retryable',
    }
  }

  const classified = classifyError(
    error,
    'Request failed while syncing order status',
  )

  if (classified.status !== undefined) {
    const { status } = classified
    const code = UNAUTHORIZED_STATUS_CODES.includes(status)
      ? 'unauthorized'
      : TIMEOUT_STATUS_CODES.includes(status)
        ? 'timeout'
        : RETRYABLE_STATUS_CODES.includes(status)
          ? 'retryable'
          : 'unknown'
    return { message: classified.message, code }
  }

  return { message: classified.message, code: 'unknown' }
}

export const getOrderSyncRetryDelay = (attempt: number): number => {
  const exponential =
    ORDER_SYNC_RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1)

  const jitter = exponential * 0.2 * Math.random()

  return Math.min(exponential + jitter, ORDER_SYNC_RETRY_MAX_DELAY_MS)
}
