import { HTTPError } from 'ky'
import { ParameterError } from './ParameterError'

export async function handleErrors(
  error: unknown,
  message: string,
): Promise<Error> {
  if (error instanceof HTTPError) {
    const errorResponse = (await error.response.json<{ error: string }>()) || {
      error: 'Unknown error occurred',
    }

    return new Error(errorResponse.error, { cause: error })
  } else if (error instanceof ParameterError) {
    return new Error(error.message, { cause: error })
  }

  const textError = extractTextError(error)
  if (textError) {
    return textError
  }

  return new Error(message, { cause: error })
}

function extractTextError(error: unknown): Error | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'text' in error &&
    typeof error.text === 'string'
  ) {
    return new Error(error.text, { cause: error })
  }
  return null
}
