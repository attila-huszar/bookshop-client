import { css } from 'styled-components'

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

export const mediaQuery = {
  up: (bp: Breakpoint) => `(width >= ${breakpoints[bp]}px)`,
  down: (bp: Breakpoint) => `(width < ${breakpoints[bp]}px)`,
  between: (a: Breakpoint, b: Breakpoint) =>
    `(${breakpoints[a]}px <= width < ${breakpoints[b]}px)`,
}

export const media = {
  up:
    (bp: Breakpoint) =>
    (...args: Parameters<typeof css>) => css`
      @media ${mediaQuery.up(bp)} {
        ${css(...args)}
      }
    `,
  down:
    (bp: Breakpoint) =>
    (...args: Parameters<typeof css>) => css`
      @media ${mediaQuery.down(bp)} {
        ${css(...args)}
      }
    `,
  between:
    (a: Breakpoint, b: Breakpoint) =>
    (...args: Parameters<typeof css>) => css`
      @media ${mediaQuery.between(a, b)} {
        ${css(...args)}
      }
    `,
}
