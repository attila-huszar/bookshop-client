import { css } from 'styled-components'

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

const max = (bp: Breakpoint) => `${breakpoints[bp] - 0.05}px`
const min = (bp: Breakpoint) => `${breakpoints[bp]}px`

export const media = {
  up:
    (bp: Breakpoint) =>
    (...args: Parameters<typeof css>) => css`
      @media (min-width: ${min(bp)}) {
        ${css(...args)}
      }
    `,
  down:
    (bp: Breakpoint) =>
    (...args: Parameters<typeof css>) => css`
      @media (max-width: ${max(bp)}) {
        ${css(...args)}
      }
    `,
  between:
    (a: Breakpoint, b: Breakpoint) =>
    (...args: Parameters<typeof css>) => css`
      @media (min-width: ${min(a)}) and (max-width: ${max(b)}) {
        ${css(...args)}
      }
    `,
}
