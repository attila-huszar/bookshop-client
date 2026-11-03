import { TimeMs } from '@/constants/time'

export const paymentStatusPolicy = {
  maxAttempts: 3,
  retryDelayMs: TimeMs.FiveSeconds,
  timeoutMs: TimeMs.ThirtySeconds,
  retryMultiplier: 2,
} as const
