import { styled } from 'styled-components'
import { StyleTypes } from './IconButton.types'

const size = {
  xs: '1.5rem',
  sm: '2rem',
  md: '2.5rem',
  lg: '3rem',
}

const iconHeight = {
  xs: '1rem',
  sm: '1.25rem',
  md: '1.5rem',
  lg: '2rem',
}

export const StyledIconButton = styled.button<StyleTypes>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ $size = 'md' }) => size[$size]};
  width: ${({ $size = 'md' }) => size[$size]};
  color: ${({ $color }) => $color ?? 'var(--light-black)'};
  background: none;
  border: ${({ $outline, $color }) =>
    $outline ? `3px solid ${$color ?? 'var(--light-black)'}` : 'none'};
  border-radius: ${({ $round }) => ($round ? '999px' : '10px')};
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: var(--secondary-color);
    border-color: var(--secondary-color);
  }

  svg {
    height: ${({ $iconSize = 'md' }) => iconHeight[$iconSize]};
    border-radius: ${({ $round }) => ($round ? '999px' : undefined)};

    ${({ $flipH }) => $flipH && 'transform: scaleX(-1);'}
    ${({ $flipV }) => $flipV && 'transform: scaleY(-1);'}
  }

  &:disabled {
    color: var(--light-grey);
  }
`
