import { HTTPError } from 'ky'

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
    } catch (jsonError) {
      console.warn('Error parsing HTTP error response:', jsonError)
      return new Error(message)
    }
  } else if (error instanceof Error) {
    console.warn('Non-HTTP error:', error)
    return new Error(error.message || message)
  } else {
    console.error('Unknown error:', error)
    return new Error(message)
  }
}
