import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { breakpoints, mediaQuery } from '@/styles/media.breakpoints'
import { useMediaQuery } from './useMediaQuery'

const mobileQuery = mediaQuery.down('sm')
const matchMedia = window.matchMedia.bind(window)
const queries: MediaQueryList[] = []

beforeEach(() => {
  queries.length = 0
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
    const result = matchMedia(query)
    queries.push(result)

    return result
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const resize = (width: number) => {
  act(() => {
    vi.stubGlobal('innerWidth', width)
    for (const query of queries) {
      const { matches } = matchMedia(query.media)
      if (query.matches !== matches) {
        Object.assign(query, { matches })
        query.dispatchEvent(new Event('change'))
      }
    }
  })
}

describe('useMediaQuery', () => {
  it('updates when the viewport crosses the mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', breakpoints.sm - 1)
    const { result } = renderHook(() => useMediaQuery(mobileQuery))
    expect(result.current).toBe(true)

    resize(breakpoints.sm)
    expect(result.current).toBe(false)

    resize(breakpoints.sm - 1)
    expect(result.current).toBe(true)
  })

  it('does not rerender consumers for resizes within the same breakpoint', () => {
    vi.stubGlobal('innerWidth', breakpoints.sm - 1)
    const render = vi.fn()
    renderHook(() => {
      const result = useMediaQuery(mobileQuery)
      render()

      return result
    })
    const initialRenderCount = render.mock.calls.length

    resize(breakpoints.sm - 20)
    resize(breakpoints.sm - 40)
    expect(render).toHaveBeenCalledTimes(initialRenderCount)

    resize(breakpoints.sm)
    expect(render).toHaveBeenCalledTimes(initialRenderCount + 1)

    resize(breakpoints.md)
    expect(render).toHaveBeenCalledTimes(initialRenderCount + 1)
  })
})
