import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

/** Debounces calls using the latest callback; delay changes affect future calls. */
export const useDebouncedCallback = <T extends unknown[]>(
  func: (...args: T) => unknown,
  delay = 300,
): ((...args: T) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(func)

  useLayoutEffect(() => {
    callbackRef.current = func
  }, [func])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        callbackRef.current(...args)
      }, delay)
    },
    [delay],
  )
}
