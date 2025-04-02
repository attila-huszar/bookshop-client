import { HTTPError } from 'ky'
import { ParameterError } from './ParameterError'

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
      const response = await error.response.json<{ error: string }>()

      return new Error(response.error || message)
    } catch {
      return new Error(message)
    }
  } else if (error instanceof ParameterError) {
    return new Error(error.message)
  }

  const textError = extractTextError(error)

  return textError ?? new Error(message)
}

function extractTextError(error: unknown): Error | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'text' in error &&
    typeof error.text === 'string'
  ) {
    return new Error(error.text)
  }
  return null
}
