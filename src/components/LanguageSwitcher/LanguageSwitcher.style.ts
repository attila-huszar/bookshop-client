import { styled } from 'styled-components'

export const Switcher = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.5rem;

  button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--border-radius);
    background: transparent;
    color: inherit;
    font-size: 0.75rem;
    cursor: pointer;
  }

  button[aria-pressed='true'] {
    background: var(--color-secondary-container);
    color: var(--color-on-secondary-container);
    border-color: var(--color-secondary);
  }

  p {
    flex-basis: 100%;
    font-size: 0.75rem;
  }
`
