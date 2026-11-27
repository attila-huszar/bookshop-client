import { css } from 'styled-components'

export const buttonHeight = {
  xs: '1.5rem',
  sm: '2rem',
  smMd: '2.25rem',
  md: '2.5rem',
  lg: '3rem',
  wide: '2.5rem',
}

export const iconButtonTouchArea = css`
  @media (pointer: coarse) {
    &::after {
      content: '';
      position: absolute;
      inset: min(-1px, calc((var(--icon-button-size) - 44px) / 2 - 1px));
    }
  }
`

export const buttonInteractionStyles = css`
  cursor: pointer;
  transition:
    background-color 150ms ease-out,
    border-color 150ms ease-out,
    box-shadow 150ms ease-out,
    scale 150ms ease-out;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: no-preference) {
    &:active:not(:disabled) {
      scale: 0.98;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`
