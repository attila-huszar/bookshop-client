import styled from 'styled-components'
import { StyleTypes } from './IconButton.types'

const iconHeight = {
  sm: '22px',
  md: '26px',
  lg: '30px',
}

const iconWidth = {
  sm: '24px',
  md: '28px',
  lg: '32px',
}

export const StyledIconButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  padding: 3px;
  color: ${({ $color }) => $color || 'var(--light-black)'};
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease-out;
  border: ${({ $bordered }) =>
    $bordered ? '2px solid var(--secondary-color)' : undefined};
  border-radius: ${({ $bordered }) => ($bordered ? '50%' : undefined)};

  &:hover {
    color: var(--secondary-color);
  }

  svg {
    height: ${({ $iconSize = 'md', $bordered }) =>
      $bordered ? '38px' : iconHeight[$iconSize]};
    width: ${({ $iconSize = 'md', $bordered }) =>
      $bordered ? '38px' : iconWidth[$iconSize]};
    border-radius: ${({ $bordered }) => ($bordered ? '50%' : undefined)};
  }

  &:disabled {
    color: var(--light-grey);
  }
`
