import styled, { keyframes } from 'styled-components'

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`

export const StyledDrawerPanel = styled.dialog`
  position: fixed;
  inset: 0 auto 0 0;
  margin: 0;
  padding: 0;
  border: 0;
  flex-direction: column;
  width: 60vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  background: transparent;
  color: inherit;
  overscroll-behavior: contain;

  &[open] {
    display: flex;

    @media (prefers-reduced-motion: no-preference) {
      animation: ${slideIn} 0.3s ease-in-out;
    }
  }

  &::backdrop {
    background-color: var(--color-backdrop);
  }
`

export const DrawerCloseButton = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1;
`
