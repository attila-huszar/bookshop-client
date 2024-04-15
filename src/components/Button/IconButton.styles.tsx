import styled from 'styled-components'
import { StyleTypes } from './IconButton.types'

export const StyledIconButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  outline: none;
  padding: 0;
  border: none;
  cursor: pointer;
  color: var(--textColor);
  background: none;
  transition: all 0.2s ease-out;
  height: ${({ $iconSize }) => {
    if ($iconSize === 'sm') {
      return '22px'
    } else if ($iconSize === 'lg') {
      return '30px'
    } else {
      return '26px'
    }
  }};
  width: ${({ $iconSize }) => {
    if ($iconSize === 'sm') {
      return '24px'
    } else if ($iconSize === 'lg') {
      return '32px'
    } else {
      return '28px'
    }
  }};

  &:hover {
    color: var(--generalColor);
  }
`
