export type RegistrationTypes = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  $valid: boolean
  $error: string | false | undefined
}

export interface IFormikField {
  name: string
  placeholder: string
  type?: React.HTMLInputTypeAttribute | undefined
  inputMode?:
    | 'text'
    | 'search'
    | 'email'
    | 'tel'
    | 'url'
    | 'none'
    | 'numeric'
    | 'decimal'
    | undefined
}
