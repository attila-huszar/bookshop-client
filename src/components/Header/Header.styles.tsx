import styled from 'styled-components'

export const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 35px;
  height: 5rem;
  width: 100%;
  max-width: 90rem;
  padding: 0 6.25rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  z-index: 2;
`
