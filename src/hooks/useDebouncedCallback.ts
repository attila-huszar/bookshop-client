import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { uiTiming } from '@/constants/uiTiming'

/** Debounces the latest callback; cancel clears queued work. Delay changes affect future calls. */
export const useDebouncedCallback = <T extends unknown[]>(
  func: (...args: T) => unknown,
  delay: number = uiTiming.defaultDebounceMs,
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const callbackRef = useRef(func)

  useLayoutEffect(() => {
    callbackRef.current = func
  }, [func])

  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
  }, [])

  useEffect(() => cancel, [cancel])

  return useMemo(() => {
    const debounced = (...args: T) => {
      cancel()

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined
        callbackRef.current(...args)
      }, delay)
    }
    debounced.cancel = cancel

    return debounced
  }, [cancel, delay])
}
