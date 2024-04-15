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
  color: #fff;
  background-color: var(--generalColor);
  box-shadow: ${({ $shadowed }) =>
    $shadowed ? '#ffce1a50 0px 5px 10px' : undefined};
  border: none;
  border-radius: 10px;
  outline: 3px solid var(--generalColor);
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: var(--generalColor);
    background-color: #fff;
  }
`
