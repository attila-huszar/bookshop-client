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
  min-width: var(--min-width);
  max-width: var(--max-width);
  padding: 0 6.25rem;
  background-color: #ffffff85;
  backdrop-filter: blur(10px);
  z-index: 3;
`
