import styled from 'styled-components'

export const SubscribeForm = styled.form`
  display: flex;
  margin-top: 0.5rem;
  border: 2px solid var(--generalColor);
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

  input:focus {
    outline: none;
  }

  form:focus-within {
    outline: 2px solid var(--favoriteColor);
  }

  button {
    padding: 0.5rem 2rem;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    background-color: var(--generalColor);
  }
`
