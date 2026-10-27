import { styled } from 'styled-components'

export const LanguageTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-outline-variant);

  button {
    padding: 0.5rem 1.25rem;
    border: none;
    border-bottom: 3px solid transparent;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button[aria-selected='true'] {
    border-bottom-color: var(--color-primary);
    background: var(--color-surface-container-lowest);
    color: var(--color-primary);
  }
`

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
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: 0.75rem;
  }
  form {
    gap: 1.25rem;
  }
  textarea,
  select {
    width: 100%;
    min-width: 0;
    padding: 0.75rem;
    border: 1px solid var(--color-outline);
    border-radius: var(--border-radius);
    background: var(--color-surface-container-lowest);
    color: inherit;
    font: inherit;
  }
  textarea {
    resize: vertical;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.75rem;

    > button {
      max-width: 100%;
    }
  }
`
