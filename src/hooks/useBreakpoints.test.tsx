import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { breakpoints } from '@/styles/media.breakpoints'
import { useBreakpoints } from './useBreakpoints'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useBreakpoints', () => {
  it.each([
    [breakpoints.xs, 'isMobile'],
    [breakpoints.sm - 0.5, 'isMobile'],
    [breakpoints.sm, 'isTablet'],
    [breakpoints.md - 0.5, 'isTablet'],
    [breakpoints.md, 'isLaptop'],
    [breakpoints.lg - 0.5, 'isLaptop'],
    [breakpoints.lg, 'isDesktop'],
    [breakpoints.xl - 0.5, 'isDesktop'],
    [breakpoints.xl, 'isWideDesktop'],
  ])('matches one range at %spx (%s)', (width, flag) => {
    vi.stubGlobal('innerWidth', width)
    const { result } = renderHook(() => useBreakpoints())
    const matching = Object.entries(result.current).filter(
      ([, matches]) => matches,
    )

    expect(matching).toEqual([[flag, true]])
  })
})
