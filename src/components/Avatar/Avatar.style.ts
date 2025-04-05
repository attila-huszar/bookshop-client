import { styled } from 'styled-components'
import { StyleTypes } from './Avatar.types'

export const StyledAvatar = styled.div<StyleTypes>`
  position: relative;
  display: flex;
  height: ${({ $size }) => $size + 'px'};
  width: ${({ $size }) => $size + 'px'};
  border: 2px solid transparent;
  border-radius: 9999px;
  outline: 2px solid var(--secondary-color);
  cursor: pointer;
  transition: all 0.2s ease-out;

  & > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 9999px;
  }

  &::after {
    content: '';
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #f7f7f775;
    border-radius: 9999px;
    transition: all 0.2s ease-out;
    ${({ $hoverControls }) => $hoverControls && 'clip-path: inset(75% 0 0 0);'}
  }

  &:hover::after {
    opacity: 1;
  }

  & > svg {
    height: auto;
    width: ${({ $size }) => $size + 'px'};
    padding: 4px;
    border-radius: 50%;
  }
`

export const IconOverlay = styled.div`
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  opacity: 0;
  transition: opacity 0.2s ease-out;

  ${StyledAvatar}:hover & {
    opacity: 1;
  }
`

export const RemoveAvatar = styled.button`
  position: absolute;
  top: 0;
  right: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: var(--orange);
  background: var(--white);
  box-shadow: var(--shadow);
  border: none;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.2s ease-out;

  & > svg {
    height: 1rem;
  }

  ${StyledAvatar}:hover & {
    opacity: 1;
  }
`
