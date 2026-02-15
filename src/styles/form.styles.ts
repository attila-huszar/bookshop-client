import { css, styled } from 'styled-components'

export const InputWrapper = styled.div`
  position: relative;
`

export const baseInputStyles = css<FormTypes>`
  width: 100%;
  padding-inline: 0.75rem;
  font-size: 1rem;
  border: 1px solid lightgrey;
  border-radius: var(--border-radius);
  background-color: #fff;

  &:focus,
  &:active {
    border: 1px solid rgb(26, 33, 43);
    box-shadow:
      rgb(210, 213, 217) 0px 0px 2px 1px,
      rgb(227, 230, 232) 0px 0px 0px 3px;
    outline: none;
  }

  ${({ $valid }) =>
    $valid &&
    `
      border: 1px solid rgb(0, 156, 38);
      outline: none;
      
      &:focus,
      &:active {
        border: 1px solid rgb(0, 156, 38);
        box-shadow:
          rgb(106, 237, 97) 0px 0px 2px 1px,
          rgb(177, 247, 160) 0px 0px 0px 3px;
        outline: none;
      }
    `}

  ${({ $error }) =>
    $error &&
    `
      border: 1px solid rgb(191, 49, 12);
      outline: none;

      &:focus,
      &:active {
        border: 1px solid rgb(191, 49, 12);
        box-shadow:
          rgb(244, 129, 116) 0px 0px 2px 1px,
          rgb(251, 178, 174) 0px 0px 0px 3px;
        outline: none;
      }
    `}

    ${({ disabled }) =>
    disabled &&
    `background-color: var(--light-grey);
    color: var(--black);
    cursor: not-allowed;
    `}

    ${({ readOnly }) =>
    readOnly && `background-color: var(--white-smoke); color: var(--black); `}
`

export const Input = styled.input<FormTypes>`
  ${baseInputStyles}
  height: 3rem;

  &[type='file'] {
    align-content: center;
  }
`

export const Select = styled.select<FormTypes>`
  ${baseInputStyles}
  height: 3rem;
  padding-right: 3rem;

  &:disabled {
    color: var(--black);
  }
`

export const Textarea = styled.textarea<FormTypes>`
  ${baseInputStyles}
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  resize: vertical;
`

export const ErrorMessage = styled.div<{
  $passwordError?: boolean
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: ${({ $passwordError }) => ($passwordError ? '3.25rem' : '0.5rem')};
  padding: 0.5rem 0.75rem;
  color: rgb(120, 27, 0);
  background-color: rgb(255, 245, 245);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  user-select: none;
  z-index: 1;
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 2rem;

  button[type='reset'] {
    position: absolute;
    left: 10%;
  }

  button[type='button'] {
    position: absolute;
    right: 10%;
  }
`

export const PasswordEye = styled.button`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  background: none;
  border: none;
  cursor: pointer;

  svg {
    width: 1.5rem;
    color: var(--grey);
  }
`

export type FormTypes = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  $valid: boolean
  $error: boolean | string | undefined
}
