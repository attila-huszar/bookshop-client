/** Seconds used for unused-cache retention and freshness checks on remount. */
export const cacheTimes = {
  catalogue: 5 * 60,
  featured: 15 * 60,
  reference: 60 * 60,
  countryCodes: 7 * 24 * 60 * 60,
}
