import styled from 'styled-components'

export const StyledHeader = styled.header`
  position: fixed;
  top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 35px;
  height: 6.5rem;
  width: 100%;
  max-width: 90rem;
  padding: 0 6.25rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  z-index: 2;
`

export const ExtraSpace = styled.div`
  position: fixed;
  top: 0;
  height: 1.5rem;
  width: 100%;
  max-width: 90rem;
  background-color: #ecb346;
  z-index: 3;

  &::before {
    content: '';
    position: absolute;
    bottom: -20px;
    height: 20px;
    width: 20px;
    border-top-left-radius: 20px;
    box-shadow: -20px -20px 0 20px var(--edgeColor);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    right: 0;
    height: 20px;
    width: 20px;
    border-top-right-radius: 20px;
    box-shadow: 20px -20px 0 20px var(--edgeColor);
  }
`
