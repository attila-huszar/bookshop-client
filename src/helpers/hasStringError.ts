export const hasStringError = (v: unknown): v is { error: string } =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { error?: unknown }).error === 'string'
