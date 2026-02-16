import styled from 'styled-components'

export const StyledMenuDropdown = styled.div<{ $show: boolean }>`
  display: grid;
  position: absolute;
  top: 3rem;
  left: 0;
  width: 12rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
  z-index: 100;
  background-color: var(--white);

  ${({ $show }) => `
    grid-template-rows: ${$show ? '1fr' : '0fr'};
    opacity: ${$show ? 1 : 0};
  `}
`
