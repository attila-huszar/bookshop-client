import { styled } from 'styled-components'

export const Text = styled.p`
  margin: 1.25rem 0;
  font-size: 1rem;
  text-wrap: pretty;
`

export const SubscribeForm = styled.form`
  display: flex;
  width: min(100%, 32rem);
  border: 2px solid var(--color-page-frame);
  border-radius: 10px;
  overflow: hidden;

  input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.5rem 1rem;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-on-surface-variant);
    background-color: var(--color-surface-container-lowest);

    &:focus-visible {
      outline: none;
    }
  }

  button {
    flex-shrink: 0;
    padding: 0.5rem 2rem;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-on-tertiary);
    background-color: var(--color-page-frame);
    cursor: pointer;
    transition:
      color 0.2s ease-out,
      background-color 0.2s ease-out;

    &:hover:not(:disabled) {
      color: var(--color-page-frame);
      background-color: var(--color-surface-container-lowest);
    }

    &:disabled {
      color: var(--color-on-surface-variant);
      background-color: var(--color-surface-container-high);
    }

    &:focus-visible {
      outline-color: var(--color-page-frame);
      outline-offset: -3px;
    }
  }

  @container footer-subscribe (inline-size < 27rem) {
    flex-direction: column;

    input {
      padding-inline: 0.5rem;
    }

    button {
      padding-inline: 1rem;
    }
  }

  @container footer-subscribe (inline-size < 15.5rem) {
    input::placeholder {
      font-size: 0.8125rem;
    }
  }
`
