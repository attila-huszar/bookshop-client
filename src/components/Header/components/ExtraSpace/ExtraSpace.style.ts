import { styled } from 'styled-components'

export const ExtraSpace = styled.div`
  position: sticky;
  top: 0;
  height: 1.5rem;
  width: 100%;
  min-width: var(--min-width);
  max-width: var(--max-width);
  background-color: var(--primary-color);
  z-index: 4;

  &::before {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    height: 1.5rem;
    width: 1.5rem;
    border-top-left-radius: 20px;
    box-shadow: -20px -20px 0 20px var(--primary-color);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    right: 0;
    height: 1.5rem;
    width: 1.5rem;
    border-top-right-radius: 20px;
    box-shadow: 20px -20px 0 20px var(--primary-color);
  }
`
