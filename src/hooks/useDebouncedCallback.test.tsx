import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedCallback } from './useDebouncedCallback'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('useDebouncedCallback', () => {
  it('cancels queued work repeatedly and can schedule new work afterward', () => {
    const callback = vi.fn<(value: string) => void>()
    const { result } = renderHook(() => useDebouncedCallback(callback))

    act(() => {
      result.current.cancel()
      result.current('cancelled')
      vi.advanceTimersByTime(200)
      result.current.cancel()
      result.current.cancel()
      vi.advanceTimersByTime(1000)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      result.current('next')
      vi.advanceTimersByTime(300)
    })
    expect(callback).toHaveBeenCalledExactlyOnceWith('next')
  })

  it('cancels the latest queued call after earlier calls have been replaced', () => {
    const callback = vi.fn<(value: string) => void>()
    const { result } = renderHook(() => useDebouncedCallback(callback))

    act(() => {
      result.current('first')
      vi.advanceTimersByTime(200)
      result.current('last')
      vi.advanceTimersByTime(200)
      result.current.cancel()
      vi.advanceTimersByTime(1000)
    })
    expect(callback).not.toHaveBeenCalled()
  })

  it('keeps scheduling and cancellation identities stable across callback changes', () => {
    const originalCallback = vi.fn<(value: string) => void>()
    const latestCallback = vi.fn<(value: string) => void>()
    const { result, rerender } = renderHook(
      (callback) => useDebouncedCallback(callback),
      { initialProps: originalCallback },
    )
    const debounced = result.current
    const cancel = debounced.cancel

    act(() => {
      debounced('pending')
    })
    rerender(latestCallback)

    expect(result.current).toBe(debounced)
    expect(result.current.cancel).toBe(cancel)

    act(() => {
      cancel()
      vi.advanceTimersByTime(300)
    })
    expect(originalCallback).not.toHaveBeenCalled()
    expect(latestCallback).not.toHaveBeenCalled()
  })

  it('waits for the last call and uses its arguments', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback))

    act(() => {
      result.current('first')
      vi.advanceTimersByTime(200)
      result.current('last', 2)
      vi.advanceTimersByTime(299)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(callback).toHaveBeenCalledExactlyOnceWith('last', 2)
  })

  it('uses the latest committed callback without restarting a pending call', () => {
    const originalCallback = vi.fn<(value: string) => void>()
    const latestCallback = vi.fn<(value: string) => void>()
    const { result, rerender } = renderHook(
      (callback) => useDebouncedCallback(callback),
      { initialProps: originalCallback },
    )

    act(() => {
      result.current('search')
      vi.advanceTimersByTime(200)
    })
    rerender(latestCallback)

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(originalCallback).not.toHaveBeenCalled()
    expect(latestCallback).toHaveBeenCalledExactlyOnceWith('search')
  })

  it('keeps a pending call on its original schedule when the delay changes', () => {
    const callback = vi.fn()
    const { result, rerender } = renderHook(
      (delay) => useDebouncedCallback(callback, delay),
      { initialProps: 300 },
    )

    act(() => {
      result.current('pending')
      vi.advanceTimersByTime(200)
    })
    rerender(500)

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(callback).toHaveBeenCalledExactlyOnceWith('pending')

    act(() => {
      result.current('next')
      vi.advanceTimersByTime(499)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(callback).toHaveBeenLastCalledWith('next')
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('cancels a pending call on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback))

    act(() => {
      result.current('search')
    })
    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(callback).not.toHaveBeenCalled()
  })
})
