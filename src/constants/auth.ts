import { TimeMs } from '@/constants/time'

export const sessionRetryPolicy = {
  initialDelayMs: TimeMs.OneSecond,
  maxAttempts: 4,
  multiplier: 2,
} as const
