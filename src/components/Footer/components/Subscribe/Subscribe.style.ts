import { styled } from 'styled-components'

export const Text = styled.p`
  margin: 1.25rem 0;
  font-size: 1rem;
`

export const SubscribeForm = styled.form`
  display: flex;
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  overflow: hidden;

  input {
    flex-grow: 1;
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
`
