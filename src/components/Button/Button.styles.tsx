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
  font-size: ${({ fontSize }) => fontSize || '0.875rem'};
  font-weight: 700;
  padding: 0.375rem 1.25rem;
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
