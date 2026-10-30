/** Shared RTK Query durations in seconds for retention, refetching, and prefetching. */
export const enum CacheTime {
  None = 0,
  FiveMinutes = 5 * 60,
  FifteenMinutes = 15 * 60,
  OneHour = 60 * 60,
  OneWeek = 7 * 24 * 60 * 60,
}
