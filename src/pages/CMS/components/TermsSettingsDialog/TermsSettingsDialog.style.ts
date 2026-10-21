import { styled } from 'styled-components'

export const Dialog = styled.dialog`
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(48rem, 92vw);
  max-height: 90dvh;
  padding: 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
  box-shadow: var(--shadow);

  &::backdrop {
    background: rgb(0 0 0 / 45%);
  }
  h2,
  p {
    margin-bottom: 1rem;
  }
  form,
  label {
    display: grid;
    gap: 0.75rem;
  }
  form {
    gap: 1.25rem;
  }
  textarea {
    width: 100%;
    resize: vertical;
    padding: 0.75rem;
    border: 1px solid var(--color-outline);
    border-radius: var(--border-radius);
    background: var(--color-surface-container-lowest);
    color: inherit;
    font: inherit;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
`
