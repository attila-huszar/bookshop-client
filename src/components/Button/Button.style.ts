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

export const StyledButton = styled.button<StyleTypes>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: ${({ $size = 'md' }) => height[$size]};
  width: ${({ $size = 'md' }) => width[$size]};
  font-size: ${({ $textSize = 'md' }) => fontSize[$textSize]};
  font-weight: 700;
  color: ${({ $inverted }) =>
    $inverted ? 'var(--primary-color)' : 'var(--white)'};
  background-color: ${({ $inverted }) =>
    $inverted ? 'var(--white)' : 'var(--primary-color)'};
  box-shadow: ${({ $shadow }) =>
    $shadow ? 'var(--primary-light) 0px 5px 10px' : undefined};
  border: none;
  border-radius: 10px;
  outline: 3px solid var(--primary-color);
  outline-offset: -3px;
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: ${({ $inverted }) =>
      $inverted ? 'var(--white)' : 'var(--primary-color)'};
    background-color: ${({ $inverted }) =>
      $inverted ? 'var(--primary-color)' : 'var(--white)'};
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
