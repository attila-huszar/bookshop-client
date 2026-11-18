import { styled } from 'styled-components'

export const GoogleSignInWrapper = styled.fieldset`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  width: 100%;
  max-width: 30rem;
  min-inline-size: 0;
  margin: 0.5rem 0 0;
  padding: 0;

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`

export const Divider = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: var(--color-on-surface-variant);
  font-size: 0.875rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-outline-variant);
  }
`
