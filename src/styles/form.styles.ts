import { css, styled } from 'styled-components'
import { media } from './media.breakpoints'

export const InputWrapper = styled.div`
  position: relative;
`

export const baseInputStyles = css<FormTypes>`
  width: 100%;
  padding-inline: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-outline);
  border-radius: var(--border-radius);
  background-color: var(--color-surface-container-lowest);
  color: var(--color-on-surface);

  &:focus,
  &:active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-container);
    outline: none;
  }

  ${({ $valid }) =>
    $valid &&
    `
      border-color: var(--color-tertiary);
      outline: none;
      
      &:focus,
      &:active {
        border-color: var(--color-tertiary);
        box-shadow: 0 0 0 3px var(--color-tertiary-container);
        outline: none;
      }
    `}

  ${({ $error }) =>
    $error &&
    `
      border-color: var(--color-error);
      outline: none;

      &:focus,
      &:active {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-container);
        outline: none;
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: var(--color-surface-container-high);
      color: var(--color-on-surface);
      cursor: not-allowed;
    `}

  ${({ readOnly }) =>
    readOnly &&
    css`
      background-color: var(--color-surface-container-low);
      color: var(--color-on-surface);
    `}
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
    color: var(--color-on-surface);
  }
`

export const Textarea = styled.textarea<FormTypes>`
  ${baseInputStyles}
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  resize: vertical;
`

export const ErrorMessage = styled.div`
  padding: 0.25rem 0.75rem;
  color: var(--color-error-hover);
  font-size: 0.875rem;
  line-height: 1.25;
  user-select: none;
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 3rem;

  ${media.down('sm')`
      gap: 1.5rem;
  `}
`

export const PasswordEye = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  touch-action: manipulation;

  svg {
    width: 1.5rem;
    color: var(--color-on-surface-variant);
  }
`

export type FormTypes = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  $valid?: boolean
  $error?: boolean | string
}
