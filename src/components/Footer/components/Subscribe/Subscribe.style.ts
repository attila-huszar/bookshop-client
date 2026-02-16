import { styled } from 'styled-components'
import { media } from '@/styles'

export const Text = styled.p`
  margin: 1.25rem 0;
  font-size: 1rem;
  text-wrap: pretty;
`

export const SubscribeForm = styled.form`
  display: flex;
  width: min(100%, 32rem);
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  overflow: hidden;

  input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.5rem 1rem;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: #6c6c6c;

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
    color: #fff;
    background-color: var(--primary-color);
    cursor: pointer;
    transition: all 0.2s ease-out;

    &:hover {
      color: var(--primary-color);
      background-color: #fff;
    }
  }

  ${media.down('sm')`
    flex-direction: column;

    input {
      width: 100%;
    }

    button {
      width: 100%;
      padding: 0.5rem;
    }
  `}
`
