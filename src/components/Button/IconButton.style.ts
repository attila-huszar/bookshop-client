import { styled } from 'styled-components'
import { buttonInteractionStyles } from '@/styles/button.styles'
import type { StyleTypes } from './IconButton.types'

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
  ${buttonInteractionStyles}
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ $size = 'md' }) => size[$size]};
  width: ${({ $size = 'md' }) => size[$size]};
  color: ${({ $color }) => $color ?? 'var(--color-on-surface-variant)'};
  background-color: ${({ $outline }) =>
    $outline ? 'var(--color-surface-container-lowest)' : 'transparent'};
  border: 1px solid
    ${({ $outline }) => ($outline ? 'var(--color-outline)' : 'transparent')};
  border-radius: ${({ $round }) => ($round ? '999px' : 'var(--button-radius)')};

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: var(--color-surface-container);
    }
  }

  &[aria-pressed='true']:not(:disabled),
  &[aria-expanded='true']:not(:disabled) {
    background-color: var(--color-surface-container-high);
  }

  &:active:not(:disabled) {
    background-color: var(--color-surface-container-highest);
  }

  svg {
    height: ${({ $size = 'md' }) => iconHeight[$size]};
    border-radius: ${({ $round }) => ($round ? '999px' : undefined)};

    ${({ $flipH }) => $flipH && 'transform: scaleX(-1);'}
    ${({ $flipV }) => $flipV && 'transform: scaleY(-1);'}
  }

  &:disabled {
    color: var(--color-outline);
    border-color: ${({ $outline }) =>
      $outline ? 'var(--color-outline-variant)' : 'transparent'};
  }
`
