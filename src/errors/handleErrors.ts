import { ParameterError } from './ParameterError'

export function handleErrors(error: unknown, message: string): Error {
  if (
    typeof error === 'object' &&
    error !== null &&
    'text' in error &&
    typeof error.text === 'string'
  ) {
    return new Error(error.text, { cause: error })
  }

  return new Error(error instanceof ParameterError ? error.message : message, {
    cause: error,
  })
}
