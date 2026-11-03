import { TimeMs } from '@/constants/time'

export const httpPolicy = {
  requestTimeoutMs: TimeMs.TenSeconds,
  retryLimit: 3,
} as const
