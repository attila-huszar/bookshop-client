import { styled } from 'styled-components'
import { StyleTypes } from './IconButton.types'

const size = {
  xs: '1.5rem',
  sm: '2rem',
  md: '2.5rem',
  lg: '3rem',
}

const iconHeight = {
  xs: '1rem',
  sm: '1.25rem',
  md: '1.5rem',
  lg: '1.875rem',
}

export const StyledIconButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ $size = 'md' }) => size[$size]};
  width: ${({ $size = 'md' }) => size[$size]};
  color: ${({ $color }) => $color ?? 'var(--color-on-surface-variant)'};
  background-color: transparent;
  border: ${({ $outline, $color }) =>
    $outline
      ? `3px solid ${$color ?? 'var(--color-on-surface-variant)'}`
      : 'none'};
  border-radius: ${({ $round }) => ($round ? '999px' : '10px')};
  cursor: pointer;
  transition:
    background-color 0.2s ease-out,
    box-shadow 0.2s ease-out;

  &:hover:not(:disabled),
  &[aria-pressed='true']:not(:disabled) {
    background-color: var(--color-surface-container-high);
  }

  &:active:not(:disabled) {
    background-color: var(--color-secondary-container);
  }

  svg {
    height: ${({ $size = 'md' }) => iconHeight[$size]};
    border-radius: ${({ $round }) => ($round ? '999px' : undefined)};

    ${({ $flipH }) => $flipH && 'transform: scaleX(-1);'}
    ${({ $flipV }) => $flipV && 'transform: scaleY(-1);'}
  }

  &:disabled {
    color: var(--color-outline);
    border-color: var(--color-surface-container-high);
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`
