import styled from 'styled-components'
import { dropdownSurfaceStyles } from '@/styles/dropdown.styles'

export const StyledMenuDropdown = styled.div<{ $show: boolean }>`
  ${dropdownSurfaceStyles}
  display: grid;
  position: absolute;
  top: 3rem;
  left: 0;
  width: 12rem;
  transition:
    grid-template-rows 0.2s ease,
    opacity 0.2s ease,
    visibility 0.2s;
  z-index: 100;

  ${({ $show }) => `
    grid-template-rows: ${$show ? '1fr' : '0fr'};
    opacity: ${$show ? 1 : 0};
    visibility: ${$show ? 'visible' : 'hidden'};
  `}
`
