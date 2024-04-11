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
  font-size: ${({ $textSize }) => {
    if ($textSize === 'sm') {
      return '0.75rem'
    } else if ($textSize === 'lg') {
      return '1rem'
    } else if ($textSize === 'xl') {
      return '1.25rem'
    } else {
      return '0.875rem'
    }
  }};
  padding: ${({ $padding }) => {
    if ($padding === 'sm') {
      return '0.25rem 1rem'
    } else if ($padding === 'lg') {
      return '1rem 3rem'
    } else if ($padding === 'wide') {
      return '0.375rem 4rem'
    } else {
      return '0.375rem 1.25rem'
    }
  }};
  font-weight: 700;
  border-radius: 10px;
  color: #fff;
  background-color: var(--generalColor);
  box-shadow: ${({ $shadowed }) =>
    $shadowed ? '#ffce1a50 0px 5px 10px' : undefined};
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
