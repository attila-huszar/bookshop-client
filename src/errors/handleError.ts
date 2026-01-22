import { HTTPError } from 'ky'
import { log } from '@/services'

type ErrorResponse = {
  error?: string
  validation?: {
    fieldErrors: Record<string, string[]>
    formErrors: string[]
  }
}

const DEFAULT_ERROR_MESSAGE = 'Unknown error occurred'

export async function handleError({
  error,
  message = DEFAULT_ERROR_MESSAGE,
}: {
  error: unknown
  message?: string
}): Promise<Error> {
  if (error instanceof HTTPError) {
    try {
      const response = await error.response.json<ErrorResponse>()

      if (response.validation) {
        void log.warn('Validation error', {
          error: response.validation,
          status: error.response.status,
        })

        const fieldErrors = Object.values(
          response.validation.fieldErrors,
        ).flat()
        const formErrors = response.validation.formErrors
        const allErrors = [...fieldErrors, ...formErrors]

        return new Error(allErrors.join(', ') || message)
      }

      void log.warn('Server error', {
        error: response.error,
        status: error.response.status,
      })

      return new Error(response.error ?? message)
    } catch (parseError) {
      void log.warn('Failed to parse server error', {
        parseError,
        originalError: error,
      })

      return new Error(message)
    }
  }

  if (error instanceof Error) {
    void log.error('Generic JS error', { error })
    return new Error(error.message || message)
  }

  void log.error('Unknown error', { error })
  return new Error(message)
}
