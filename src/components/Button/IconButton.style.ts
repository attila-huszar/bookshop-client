import { styled } from 'styled-components'
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
  padding: 3px 10px;
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
