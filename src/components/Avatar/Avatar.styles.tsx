import styled from 'styled-components'
import { StyleTypes } from './Avatar.types'
import cameraIcon from '../../assets/svg/camera.svg'

export const StyledAvatar = styled.button<StyleTypes>`
  position: relative;
  display: flex;
  height: ${({ $size }) => $size + 'px'};
  width: ${({ $size }) => $size + 'px'};
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid var(--secondary-color);
  cursor: pointer;
  transition: all 0.2s ease-out;

  &::after {
    content: '';
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #f7f7f775;
    border-radius: 50%;
    transition: all 0.2s ease-out;
    ${({ $clip }) => $clip && 'clip-path: inset(75% 0 0 0);'}
    ${({ $camera }) =>
      $camera &&
      `background-image: url(${cameraIcon});
      background-repeat: no-repeat;
      background-position: bottom 10% center;
      background-size: 20px 20px;
      `}
  }

  &:hover::after {
    opacity: 1;
  }

  img {
    padding: 2px;
    border-radius: 50%;
  }

  svg {
    height: auto;
    width: ${({ $size }) => $size + 'px'};
    padding: 3px;
    border-radius: 50%;
  }
`
