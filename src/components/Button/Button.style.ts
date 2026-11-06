import { styled } from 'styled-components'
import { StyleTypes } from './Button.types'

const height = {
  xs: '1.5rem',
  sm: '2rem',
  smMd: '2.25rem',
  md: '2.5rem',
  lg: '3rem',
  wide: '2.5rem',
}

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
    border: 'var(--color-primary)',
    hover: 'var(--color-primary-hover)',
    tint: 'var(--color-primary-container)',
  },
  secondary: {
    color: 'var(--color-on-secondary)',
    background: 'var(--color-secondary)',
    accent: 'var(--color-secondary)',
    border: 'var(--color-secondary)',
    hover: 'var(--color-secondary-hover)',
    tint: 'var(--color-secondary-container)',
  },
  danger: {
    color: 'var(--color-on-error)',
    background: 'var(--color-error)',
    accent: 'var(--color-error)',
    border: 'var(--color-error)',
    hover: 'var(--color-error-hover)',
    tint: 'var(--color-error-container)',
  },
  neutral: {
    color: 'var(--color-on-surface-variant)',
    background: 'var(--color-surface-container-lowest)',
    accent: 'var(--color-on-surface-variant)',
    border: 'var(--color-outline)',
    hover: 'var(--color-surface-container-high)',
    tint: 'var(--color-surface-container-high)',
  },
}

function getTheme(color: StyleTypes['$color'] = 'primary', inverted?: boolean) {
  const palette = colorMap[color]

  return {
    color: inverted ? palette.accent : palette.color,
    background: inverted
      ? 'var(--color-surface-container-lowest)'
      : palette.background,
    border: palette.border,
    hover: inverted ? palette.tint : palette.hover,
  }
}

export const StyledButton = styled.button<StyleTypes>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  min-height: ${({ $size = 'md' }) => height[$size]};
  height: auto;
  padding-block: 0.25em;
  width: ${({ $size = 'md' }) => width[$size]};
  font-size: ${({ $textSize = 'md' }) => fontSize[$textSize]};
  font-weight: 700;
  color: ${({ $color, $inverted }) => getTheme($color, $inverted).color};

  background-color: ${({ $color, $inverted }) =>
    getTheme($color, $inverted).background};
  box-shadow: ${({ $shadow }) =>
    $shadow ? 'var(--shadow-button)' : undefined};
  border: 2px solid ${({ $color }) => getTheme($color).border};
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease-out,
    border-color 0.2s ease-out,
    box-shadow 0.2s ease-out;

  &:hover:not(:disabled) {
    background-color: ${({ $color, $inverted }) =>
      getTheme($color, $inverted).hover};
    box-shadow: ${({ $shadow }) =>
      $shadow ? 'var(--shadow-button-hover)' : undefined};
  }

  &:active:not(:disabled) {
    box-shadow: var(--shadow-button-pressed);
  }

  &:disabled {
    color: var(--color-on-surface-variant);
    background-color: var(--color-surface-container-high);
    border-color: var(--color-surface-container-high);
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
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
