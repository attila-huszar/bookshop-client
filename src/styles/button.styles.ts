import { css } from 'styled-components'

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
