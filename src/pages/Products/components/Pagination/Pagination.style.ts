import { styled } from 'styled-components'

export const StyledPagination = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`

export const PageSelectButton = styled.button`
  height: 1.75rem;
  width: 1.75rem;
  font-size: 0.875rem;
  background: none;
  border: 2px solid var(--light-black);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: var(--primary-color);
    border-color: var(--primary-color);
    scale: 1.1;
  }

  &:disabled {
    color: var(--white);
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    scale: 1.1;
  }
`
