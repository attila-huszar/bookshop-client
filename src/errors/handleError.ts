import { HTTPError } from 'ky'
import { log } from '@/helpers'

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
      const response = await error.response.json<{
        error?: string
      }>()

      if (response.error) {
        void log.warn('Server error', {
          error: response.error,
          status: error.response.status,
        })

        return new Error(response.error)
      }

      void log.warn('Server error (no message)', {
        error: message,
        status: error.response.status,
      })

      return new Error(message)
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
