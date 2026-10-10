import { useCallback, useEffect, useRef } from 'react'

type Func<T extends unknown[], R> = (...args: T) => R

export const useDebounce = <T extends unknown[], R>(
  func: Func<T, R>,
  delay = 300,
): ((...args: T) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [delay])

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        func(...args)
      }, delay)
    },
    [func, delay],
  )
}
