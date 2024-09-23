import { styled } from 'styled-components'

export const SubscribeForm = styled.form`
  display: flex;
  margin-top: 3.5rem;
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  overflow: hidden;

  input {
    flex-grow: 2;
    padding: 0.5rem 2rem;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    color: #6c6c6c;
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
