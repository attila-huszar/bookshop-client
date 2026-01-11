import { styled } from 'styled-components'

export const StyledForgotPassword = styled.dialog`
  margin: 10rem auto 0;
  padding: 1.5rem 4rem;
  background-color: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);

  h2 {
    margin-bottom: 2rem;
    text-align: center;
  }

  form {
    width: auto;
  }

  > :nth-child(2),
  input {
    width: 24rem;
  }

  > :nth-child(2) {
    margin-bottom: 1rem;
  }
`
