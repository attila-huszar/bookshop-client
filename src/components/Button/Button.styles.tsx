import styled from 'styled-components'
import { StyleTypes } from './Button.types'

export const StyledButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: ${({ textSize }) => {
    if (textSize === 'sm') {
      return '0.75rem'
    } else if (textSize === 'md') {
      return '0.875rem'
    } else if (textSize === 'lg') {
      return '1rem'
    } else {
      return '0.875rem'
    }
  }};
  padding: ${({ pad }) => {
    if (pad === 'sm') {
      return '0.25rem 1rem'
    } else if (pad === 'md') {
      return '0.375rem 1.25rem'
    } else if (pad === 'lg') {
      return '1rem 3rem'
    } else {
      return '0.375rem 1.25rem'
    }
  }};
  font-weight: 700;
  border-radius: 10px;
  color: #fff;
  background-color: var(--generalColor);
  box-shadow: ${({ shadowed }) =>
    shadowed ? 'var(--generalColor) 0px 8px 24px' : undefined};
`

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  outline: none;
  padding: 0;
  border: none;
  cursor: pointer;
  background: none;
`
