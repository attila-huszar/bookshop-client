export const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return undefined
  }

  return typeof error.message === 'string' ? error.message : undefined
}

export const hasStringError = (value: unknown): value is { error: string } =>
  typeof value === 'object' &&
  value !== null &&
  'error' in value &&
  typeof value.error === 'string'
