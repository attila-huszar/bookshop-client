import styled from 'styled-components'
import { StyleTypes } from './Button.types'

const textSize = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1rem',
  xl: '1.25rem',
}

const padding = {
  sm: '0.25rem 1rem',
  md: '0.375rem 1.25rem',
  lg: '1rem 3rem',
  wide: '0.375rem 4rem',
}

export const StyledButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: ${({ $padding = 'md' }) => padding[$padding]};
  font-size: ${({ $textSize = 'md' }) => textSize[$textSize]};
  font-weight: 700;
  color: ${({ $inverted }) => ($inverted ? 'var(--primary-color)' : '#fff')};
  background-color: ${({ $inverted }) =>
    $inverted ? '#fff' : 'var(--primary-color)'};
  box-shadow: ${({ $shadowed }) =>
    $shadowed ? '#ffce1a50 0px 5px 10px' : undefined};
  border: none;
  border-radius: 10px;
  outline: 3px solid var(--primary-color);
  outline-offset: -3px;
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: ${({ $inverted }) => ($inverted ? '#fff' : 'var(--primary-color)')};
    background-color: ${({ $inverted }) =>
      $inverted ? 'var(--primary-color)' : '#fff'};
  }

  &:disabled {
    cursor: not-allowed;
    color: #fff;
    background-color: #ffe999;
    outline: 3px solid #ffe999;
  }
`
