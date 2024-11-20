import { ParameterError } from './ParameterError'

export function handleErrors(error: unknown, message: string): Error {
  if (error instanceof ParameterError) {
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
