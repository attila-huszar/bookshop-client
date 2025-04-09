import { HTTPError } from 'ky'
import { logger } from '@/helpers'

const DEFAULT_ERROR_MESSAGE = 'Unknown error occurred'

export async function handleErrors({
  error,
  message = DEFAULT_ERROR_MESSAGE,
}: {
  error: unknown
  message?: string
}): Promise<Error> {
  if (error instanceof HTTPError) {
    try {
      const response = await error.response.json<{ error?: string }>()
      return new Error(response.error ?? message)
    } catch (error) {
      logger.warn('Error parsing HTTP error response', { error })
      return new Error(message)
    }
  } else if (error instanceof Error) {
    logger.warn('Non-HTTP error', { error })
    return new Error(error.message || message)
  } else {
    logger.error(error)
    return new Error(message)
  }
}
