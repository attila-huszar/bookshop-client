import { styled } from 'styled-components'

export const StyledPagination = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`

export const PageSelectButton = styled.button`
  height: 1.75rem;
  width: 1.75rem;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  background: none;
  border: 2px solid var(--color-on-surface-variant);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s ease-out;

  &:hover:not(:disabled) {
    background-color: var(--color-surface-container-high);
  }

  &:disabled {
    color: var(--color-on-primary);
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }
`
