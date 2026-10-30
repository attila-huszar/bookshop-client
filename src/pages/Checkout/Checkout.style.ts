import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledCheckout = styled.section`
  --page-loading-height: calc(100dvh - 4rem);

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;

  .stripe-form {
    width: 32rem;

    ${media.down('sm')`
      width: 85vw;
    `}

    height: fit-content;
    padding: 1.5rem;
    border-radius: 10px;
    background-color: var(--color-surface-container-lowest);
    box-shadow: var(--shadow);
  }

  #payment-form {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  #email {
    border-radius: var(--border-radius);
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid var(--color-outline-variant);
    max-height: 44px;
    font-size: 16px;
    width: 100%;
    background: var(--color-surface-container-lowest);
    box-sizing: border-box;
  }

  #payment-message,
  #cancel-message {
    margin-top: 1rem;
    font-size: 1rem;
    text-align: center;
    color: var(--color-on-surface-variant);
  }

  #payment-message.error {
    padding: 0.625rem 1rem;
    color: var(--color-error-hover);
    background-color: var(--color-error-container);
    border: 1px solid var(--color-error);
    border-radius: var(--border-radius);
  }

  #payment-element {
    margin: 1rem 0 0;
  }

  .checkout-review {
    padding: 0.75rem;
    border-radius: var(--border-radius);
    background-color: var(--color-surface-container-high);
    font-size: 0.875rem;

    h3 {
      margin-bottom: 0.375rem;
      color: var(--color-on-surface-variant);
      font-size: 1rem;
      font-weight: 700;
    }

    p {
      margin-bottom: 0;
    }

    ul {
      display: grid;
      gap: 0.375rem;
      margin-bottom: 0.75rem;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }

  .checkout-terms {
    .checkout-terms-acceptance {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      line-height: 1.5;
    }

    label {
      cursor: pointer;
    }

    input {
      flex-shrink: 0;
      width: 1.125rem;
      height: 1.125rem;
      margin-top: 0.2rem;
      accent-color: var(--color-primary);
    }

    p {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      line-height: 1.5;
      overflow-wrap: anywhere;

      svg {
        flex-shrink: 0;
      }
    }

    a {
      text-decoration: underline;
    }
  }

  button {
    background: var(--color-primary);
    font-family: Arial, sans-serif;
    color: var(--color-on-primary);
    border-radius: 4px;
    border: 0;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: block;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease,
      filter 0.2s ease;
    box-shadow: var(--shadow-button);
    width: 100%;
  }

  button:hover:not(:disabled) {
    filter: brightness(0.9);
    box-shadow: var(--shadow-button-hover);
  }

  button:active:not(:disabled) {
    box-shadow: var(--shadow-button-pressed);
  }

  button:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.5;
    box-shadow: none;
    cursor: not-allowed;
  }

  .spinner,
  .spinner:before,
  .spinner:after {
    border-radius: 50%;
  }

  .spinner {
    color: var(--color-on-primary);
    font-size: 22px;
    text-indent: -99999px;
    margin: 0px auto;
    position: relative;
    width: 20px;
    height: 20px;
    box-shadow: inset 0 0 0 2px;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
  }

  .spinner:before,
  .spinner:after {
    position: absolute;
    content: '';
  }

  .spinner:before {
    width: 10.4px;
    height: 20.4px;
    background: var(--color-primary);
    border-radius: 20.4px 0 0 20.4px;
    top: -0.2px;
    left: -0.2px;
    -webkit-transform-origin: 10.4px 10.2px;
    transform-origin: 10.4px 10.2px;
    -webkit-animation: loading 2s infinite ease 1.5s;
    animation: loading 2s infinite ease 1.5s;
  }

  .spinner:after {
    width: 10.4px;
    height: 10.2px;
    background: var(--color-primary);
    border-radius: 0 10.2px 10.2px 0;
    top: -0.1px;
    left: 10.2px;
    -webkit-transform-origin: 0px 10.2px;
    transform-origin: 0px 10.2px;
    -webkit-animation: loading 2s infinite ease;
    animation: loading 2s infinite ease;
  }

  @keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`
