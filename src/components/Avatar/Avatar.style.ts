import { styled } from 'styled-components'

export const StyledAvatar = styled.div<{ $size: number }>`
  position: relative;
  flex-shrink: 0;
  height: ${({ $size }) => $size}px;
  width: ${({ $size }) => $size}px;
`

export const AvatarButton = styled.button<{ $hoverControls?: boolean }>`
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 9999px;
  background: transparent;
  outline: 2px solid var(--color-primary);
  cursor: pointer;

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
    background-color: var(--color-avatar-overlay);
    border-radius: 9999px;
    transition: opacity 0.2s ease-out;
    ${({ $hoverControls }) => $hoverControls && 'clip-path: inset(75% 0 0 0);'}
  }

  &:is(:hover, :focus-visible)::after {
    opacity: 1;
  }

  & > svg {
    height: auto;
    width: 100%;
    padding: 4px;
    border-radius: 50%;
  }
`

export const IconOverlay = styled.span`
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  opacity: 0;
  transition: opacity 0.2s ease-out;

  ${AvatarButton}:is(:hover, :focus-visible) & {
    opacity: 1;
  }

  @media (hover: none) {
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
  color: var(--color-error);
  background: var(--color-surface-container-lowest);
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

  &:focus-visible {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
`
