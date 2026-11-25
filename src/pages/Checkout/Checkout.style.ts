import { styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { media } from '@/styles/media.breakpoints'

export const CheckoutButton = styled(StyledButton).attrs({
  $size: 'lg',
  $textSize: 'lg',
})`
  width: 100%;
`

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

  .payment-submit-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .spinner {
    flex: none;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid currentColor;
    border-radius: 50%;

    @media (prefers-reduced-motion: no-preference) {
      border-inline-end-color: transparent;
      animation: loading 0.8s linear infinite;
    }
  }

  @keyframes loading {
    to {
      transform: rotate(1turn);
    }
  }
`
