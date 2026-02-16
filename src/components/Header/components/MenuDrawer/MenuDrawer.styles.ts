import styled from 'styled-components'

export const StyledDrawerPanel = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  width: 60vw;
  height: 100vh;
  border-radius: 0;
  transition: transform 0.3s ease-in-out;
  box-shadow: none;

  ${({ $show }) => `
    transform: ${$show ? 'translateX(0)' : 'translateX(-100%)'};
  `}
`

export const DrawerCloseButton = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1rem 0;
`

export const Backdrop = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;

  ${({ $show }) =>
    $show &&
    `
    opacity: 1;
    visibility: visible;
  `}
`
