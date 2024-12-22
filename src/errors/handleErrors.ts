import { HTTPError } from 'ky'
import { ParameterError } from './ParameterError'

export function handleErrors(error: unknown, message: string): Error {
  if (error instanceof HTTPError) {
    let errorMsg

    error.response
      .json<{ error: string }>()
      .then((response) => {
        errorMsg = response.error
      })
      .catch(() => {
        errorMsg = 'Unknown error occurred'
      })

    return new Error(errorMsg, { cause: error })
  } else if (error instanceof ParameterError) {
    return new Error(error.message, { cause: error })
  }

  const textError = extractTextError(error)

  return textError ?? new Error(message, { cause: error })
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
