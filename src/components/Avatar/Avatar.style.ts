import { styled } from 'styled-components'
import { StyleTypes } from './Avatar.types'

export const StyledAvatar = styled.div<StyleTypes>`
  position: relative;
  display: flex;
  height: ${({ $size }) => $size + 'px'};
  width: ${({ $size }) => $size + 'px'};
  border: 2px solid transparent;
  border-radius: 50%;
  outline: 2px solid var(--secondary-color);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease-out;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
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
    transition: all 0.2s ease-out;
    ${({ $clip }) => $clip && 'clip-path: inset(75% 0 0 0);'}
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

export const CameraOverlay = styled.div`
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
