import { styled } from 'styled-components'

export const StyledHeader = styled.header`
  position: sticky;
  top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2.5rem;
  height: 6rem;
  width: 100%;
  min-width: 54rem;
  max-width: 90rem;
  padding: 0 6.25rem;
  background-color: #ffffff85;
  backdrop-filter: blur(10px);
  z-index: 3;
`

export const ExtraSpace = styled.div`
  position: sticky;
  top: 0;
  height: 1.5rem;
  width: 100%;
  min-width: 54rem;
  max-width: 90rem;
  background-color: var(--secondary-color);
  z-index: 4;

  &::before {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    height: 1.5rem;
    width: 1.5rem;
    border-top-left-radius: 20px;
    box-shadow: -20px -20px 0 20px var(--secondary-color);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    right: 0;
    height: 1.5rem;
    width: 1.5rem;
    border-top-right-radius: 20px;
    box-shadow: 20px -20px 0 20px var(--secondary-color);
  }
`
