import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { breakpoints } from '@/styles/media.breakpoints'
import { useBreakpoints } from './useBreakpoints'

afterEach(() => {
  vi.unstubAllGlobals()
})

const resize = (width: number) => {
  act(() => {
    vi.stubGlobal('innerWidth', width)
    window.dispatchEvent(new Event('resize'))
  })
}

describe('useBreakpoints', () => {
  it('updates at the shared mobile and tablet boundaries', () => {
    vi.stubGlobal('innerWidth', breakpoints.sm - 1)
    const { result } = renderHook(() => useBreakpoints())
    expect(result.current).toEqual({ isMobile: true, isTablet: false })

    resize(breakpoints.sm)
    expect(result.current).toEqual({ isMobile: false, isTablet: true })

    resize(breakpoints.md)
    expect(result.current).toEqual({ isMobile: false, isTablet: false })

    resize(breakpoints.sm - 1)
    expect(result.current).toEqual({ isMobile: true, isTablet: false })
  })

  it('does not rerender consumers for resizes within the same breakpoint', () => {
    vi.stubGlobal('innerWidth', breakpoints.sm - 1)
    const render = vi.fn()
    renderHook(() => {
      const result = useBreakpoints()
      render()

      return result
    })
    const initialRenderCount = render.mock.calls.length

    resize(breakpoints.sm - 20)
    resize(breakpoints.sm - 40)
    expect(render).toHaveBeenCalledTimes(initialRenderCount)

    resize(breakpoints.sm)
    expect(render).toHaveBeenCalledTimes(initialRenderCount + 1)
  })
})
