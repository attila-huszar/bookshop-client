import { HTTPError } from 'ky'
import { ParameterError } from './ParameterError'

export function handleErrors(error: unknown, message: string): Error {
  if (error instanceof HTTPError) {
    error.response
      .json<{ error: string }>()
      .then((response) => {
        return new Error(response.error)
      })
      .catch(() => {
        return new Error('Unknown error occurred')
      })
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
