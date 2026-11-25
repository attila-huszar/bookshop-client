import { styled } from 'styled-components'

export const Text = styled.p`
  margin: 1.25rem 0;
  font-size: 1rem;
  text-wrap: pretty;
`

export const SubscribeForm = styled.form`
  display: flex;
  width: min(100%, 32rem);
  border: 1px solid var(--color-page-frame);
  border-radius: var(--button-radius);
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
      outline: 2px solid var(--color-page-frame);
      outline-offset: -2px;
    }
  }

  button {
    flex-shrink: 0;
    padding: 0.5rem 2rem;
    border: none;
    font-size: 1rem;
    font-weight: 650;
    color: var(--color-on-tertiary);
    background-color: var(--color-page-frame);
    cursor: pointer;
    transition: background-color 150ms ease-out;

    @media (hover: hover) {
      &:hover:not(:disabled) {
        background-color: color-mix(
          in srgb,
          var(--color-page-frame),
          black 10%
        );
      }
    }

    &:active:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-page-frame), black 18%);
    }

    &:disabled {
      color: var(--color-on-surface-variant);
      background-color: var(--color-surface-container-high);
    }

    &:focus-visible {
      outline-color: var(--color-on-tertiary);
      outline-offset: -4px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
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
