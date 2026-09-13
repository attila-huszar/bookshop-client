import { isHTTPError } from 'ky'
import { log } from '@/services'

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
        message: validationMessages.join(', '),
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
        : (extractDataMessage(error) ?? fallback),
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
