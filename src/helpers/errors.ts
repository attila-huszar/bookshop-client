export const getErrorCode = (error: unknown): string | number | undefined =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (typeof error.code === 'string' || typeof error.code === 'number')
    ? error.code
    : undefined

export const getErrorMessage = (error: unknown, fallback: string): string =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string' &&
  error.message.trim().length > 0
    ? error.message
    : fallback

export const hasStringError = (value: unknown): value is { error: string } =>
  typeof value === 'object' &&
  value !== null &&
  'error' in value &&
  typeof value.error === 'string'
