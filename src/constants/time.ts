export const enum TimeMs {
  TwoHundredMilliseconds = 200,
  ThreeHundredMilliseconds = 300,
  OneSecond = 1_000,
  ThreeSeconds = 3 * OneSecond,
  FiveSeconds = 5 * OneSecond,
  TenSeconds = 10 * OneSecond,
  ThirtySeconds = 30 * OneSecond,
}

/** RTK Query durations in seconds for retention, refetching, and prefetching. */
export const enum CacheTime {
  None = 0,
  FiveMinutes = 5 * 60,
  FifteenMinutes = 15 * 60,
  OneHour = 60 * 60,
  OneWeek = 7 * 24 * 60 * 60,
}

export const timeZone = 'Europe/Budapest'

export const uiTiming = {
  toastDurationMs: TimeMs.ThreeSeconds,
  defaultDebounceMs: TimeMs.ThreeHundredMilliseconds,
  countrySearchResetMs: TimeMs.TwoHundredMilliseconds,
} as const

export const httpPolicy = {
  requestTimeoutMs: TimeMs.TenSeconds,
  retryLimit: 3,
} as const

export const sessionRetryPolicy = {
  initialDelayMs: TimeMs.OneSecond,
  maxAttempts: 4,
  multiplier: 2,
} as const

export const paymentStatusPolicy = {
  maxAttempts: 3,
  retryDelayMs: TimeMs.FiveSeconds,
  timeoutMs: TimeMs.ThirtySeconds,
  retryMultiplier: 2,
} as const
