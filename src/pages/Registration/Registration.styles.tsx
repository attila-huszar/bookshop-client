import styled from 'styled-components'
import { RegistrationTypes } from './Registration.types'

export const StyledRegistration = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 6.25rem 4rem;

  h2 {
    margin-bottom: 1rem;
  }

  form {
    width: 30rem;
  }
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`

export const Label = styled.p`
  margin-top: 1rem;
`
export const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`

export const Input = styled.input<RegistrationTypes>`
  width: 100%;
  padding: 0.75rem 0.75rem;
  font-size: 1rem;
  border: 1px solid lightgrey;
  border-radius: 4px;
  background-color: white;

  &:focus,
  &:active {
    box-shadow:
      rgb(210, 213, 217) 0px 0px 2px 1px,
      rgb(227, 230, 232) 0px 0px 0px 3px;
    border: 1px solid rgb(26, 33, 43);
    outline: none;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    background-color: white;
    border: 1px solid lightgrey;
    box-shadow: 0 0 0px 1000px #fff inset;
    -webkit-box-shadow: 0 0 0px 1000px #fff inset;
    transition: background-color 5000s ease-in-out 0s;
    -webkit-text-fill-color: black;
  }

  ${({ $valid }) =>
    $valid &&
    `
      border: 1px solid rgb(0, 156, 38);

      &:focus,
      &:active {
        border: 1px solid rgb(0, 156, 38);
        box-shadow:
          rgb(106, 237, 97) 0px 0px 2px 1px,
          rgb(177, 247, 160) 0px 0px 0px 3px;
        outline: none;
      }

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus {
        border: 1px solid rgb(0, 156, 38);
      }
    `}

  ${({ $error }) =>
    $error &&
    `
      border: 1px solid rgb(191, 49, 12);
      outline: none;

      &:focus,
      &:active {
        box-shadow:
          rgb(244, 129, 116) 0px 0px 2px 1px,
          rgb(251, 178, 174) 0px 0px 0px 3px;
        border: 1px solid rgb(191, 49, 12);
        outline: none;
      }

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus {
        border: 1px solid rgb(191, 49, 12);
      }
    `}
`

export const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: rgb(120, 27, 0);
  background-color: rgb(255, 245, 245);
  border-radius: 5px;
  font-size: 0.875rem;
  z-index: 1;
`
