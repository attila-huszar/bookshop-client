type Func<T extends unknown[], R> = (...args: T) => R

export const useDebounce = <T extends unknown[], R>(
  func: Func<T, R>,
  delay = 300,
): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: T) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, delay)
  }
}
