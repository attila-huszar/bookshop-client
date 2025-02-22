import { styled } from 'styled-components'
import { StyleTypes } from './IconButton.types'

const iconHeight = {
  sm: '1.375rem',
  md: '1.625rem',
  lg: '1.875rem',
}

const iconWidth = {
  sm: '1.5rem',
  md: '1.75rem',
  lg: '2rem',
}

export const StyledIconButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  color: ${({ $color }) => $color ?? 'var(--light-black)'};
  background: none;
  border: none;
  border-radius: ${({ $round }) => ($round ? '50%' : '10px')};
  outline: ${({ $bordered }) =>
    $bordered ? '3px solid var(--primary-color)' : 'none'};
  outline-offset: -3px;
  cursor: pointer;
  transition: all 0.2s ease-out;

  ${({ $bordered }) => $bordered && 'aspect-ratio: 1/1; height: 100%;'}

  &:hover {
    color: var(--secondary-color);
  }

  svg {
    height: ${({ $iconSize = 'md' }) => iconHeight[$iconSize]};
    width: ${({ $iconSize = 'md' }) => iconWidth[$iconSize]};
    border-radius: ${({ $round }) => ($round ? '50%' : undefined)};

    ${({ $flipHorizontal }) => $flipHorizontal && 'transform: scaleX(-1);'}
    ${({ $flipVertical }) => $flipVertical && 'transform: scaleY(-1);'}
  }

  &:disabled {
    color: var(--light-grey);
  }
`
