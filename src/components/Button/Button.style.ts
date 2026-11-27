import { css, styled } from 'styled-components'
import { buttonHeight, buttonInteractionStyles } from '@/styles/button.styles'
import type { StyleTypes } from './Button.types'

const width = {
  xs: '6rem',
  sm: '7.5rem',
  smMd: '9rem',
  md: '10.5rem',
  lg: '12rem',
  wide: '18rem',
}

const fontSize = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1rem',
  xl: '1.25rem',
}

const colorMap = {
  primary: {
    color: 'var(--color-on-primary)',
    background: 'var(--color-primary)',
    accent: 'var(--color-primary)',
    hover: 'var(--color-primary-hover)',
  },
  secondary: {
    color: 'var(--color-on-secondary)',
    background: 'var(--color-secondary)',
    accent: 'var(--color-secondary)',
    hover: 'var(--color-secondary-hover)',
  },
  danger: {
    color: 'var(--color-on-error)',
    background: 'var(--color-error)',
    accent: 'var(--color-error)',
    hover: 'var(--color-error-hover)',
  },
  neutral: {
    color: 'var(--color-on-surface-variant)',
    background: 'var(--color-surface-container)',
    accent: 'var(--color-on-surface-variant)',
    hover: 'var(--color-surface-container-high)',
  },
}

export const StyledButton = styled.button<StyleTypes>`
  ${buttonInteractionStyles}
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  min-height: ${({ $size = 'md' }) => buttonHeight[$size]};
  height: auto;
  padding: 0.25em 0.75rem;
  width: ${({ $size = 'md' }) => width[$size]};
  max-width: 100%;
  min-width: 0;
  font-size: ${({ $textSize = 'md' }) => fontSize[$textSize]};
  font-weight: 650;
  line-height: 1.25;
  text-align: center;
  text-wrap: balance;
  overflow-wrap: anywhere;
  border: 1px solid transparent;
  border-radius: var(--button-radius);

  ${({ $color = 'primary', $inverted }) => {
    const palette = colorMap[$color]
    const surface = 'var(--color-surface-container-lowest)'
    const hover = $inverted
      ? `color-mix(in srgb, ${palette.accent} 9%, ${surface})`
      : palette.hover
    const active = $inverted
      ? `color-mix(in srgb, ${palette.accent} 16%, ${surface})`
      : `color-mix(in srgb, ${palette.hover}, black 6%)`

    return css`
      color: ${$inverted ? palette.accent : palette.color};
      background-color: ${$inverted ? surface : palette.background};
      border-color: ${$inverted ? 'var(--color-outline)' : 'transparent'};
      --button-hover: ${hover};
      --button-active: ${active};
    `
  }}

  box-shadow: ${({ $shadow }) =>
    $shadow ? 'var(--shadow-button)' : undefined};

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: var(--button-hover);
      box-shadow: ${({ $shadow }) =>
        $shadow ? 'var(--shadow-button-hover)' : undefined};
    }
  }

  &:active:not(:disabled) {
    background-color: var(--button-active);
    box-shadow: none;
  }

  &:disabled {
    color: var(--color-on-surface-variant);
    background-color: var(--color-surface-container-high);
    border-color: transparent;
    box-shadow: none;
  }

  > div[role='img'] {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.25em;
    height: 1.25em;

    > svg {
      width: 100%;
      height: 100%;
    }
  }
`
