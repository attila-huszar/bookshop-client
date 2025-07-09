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
    color: 'var(--white)',
    background: 'var(--primary-color)',
    outline: '3px solid var(--primary-color)',
    hover: {
      color: 'var(--primary-color)',
      background: 'var(--white)',
    },
  },
  secondary: {
    color: 'var(--white)',
    background: 'var(--secondary-dark)',
    outline: '3px solid var(--secondary-dark)',
    hover: {
      color: 'var(--secondary-dark)',
      background: 'var(--white)',
    },
  },
  danger: {
    color: 'var(--white)',
    background: 'var(--orange)',
    outline: '3px solid var(--orange)',
    hover: {
      color: 'var(--orange)',
      background: 'var(--white)',
    },
  },
  invertedPrimary: {
    color: 'var(--primary-color)',
    background: 'var(--white)',
    outline: '3px solid var(--primary-color)',
    hover: {
      color: 'var(--white)',
      background: 'var(--primary-color)',
    },
  },
  invertedSecondary: {
    color: 'var(--secondary-dark)',
    background: 'var(--white)',
    outline: '3px solid var(--secondary-dark)',
    hover: {
      color: 'var(--white)',
      background: 'var(--secondary-dark)',
    },
  },
  invertedDanger: {
    color: 'var(--orange)',
    background: 'var(--white)',
    outline: '3px solid var(--orange)',
    hover: {
      color: 'var(--white)',
      background: 'var(--orange)',
    },
  },
}

function getTheme(color: StyleTypes['$color'] = 'primary', inverted?: boolean) {
  if (inverted) {
    return color === 'primary'
      ? colorMap.invertedPrimary
      : color === 'secondary'
        ? colorMap.invertedSecondary
        : colorMap.invertedDanger
  }
  return colorMap[color]
}

export const StyledButton = styled.button<StyleTypes>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: ${({ $size = 'md' }) => height[$size]};
  width: ${({ $size = 'md' }) => width[$size]};
  font-size: ${({ $textSize = 'md' }) => fontSize[$textSize]};
  font-weight: 700;
  color: ${({ $color, $inverted }) => getTheme($color, $inverted).color};

  background-color: ${({ $color, $inverted }) =>
    getTheme($color, $inverted).background};
  box-shadow: ${({ $shadow }) =>
    $shadow ? 'var(--primary-light) 0px 5px 10px' : undefined};
  border: none;
  border-radius: 10px;
  outline: ${({ $color, $inverted }) => getTheme($color, $inverted).outline};
  outline-offset: -3px;
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: ${({ $color, $inverted }) =>
      getTheme($color, $inverted).hover.color};

    background-color: ${({ $color, $inverted }) =>
      getTheme($color, $inverted).hover.background};
  }

  &:disabled {
    color: var(--white);
    background-color: var(--primary-faded);
    outline: 3px solid var(--primary-faded);
  }

  div {
    display: flex;
    justify-content: center;
    width: 15%;
    max-height: 50%;
  }
`
