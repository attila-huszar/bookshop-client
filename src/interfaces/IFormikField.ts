export interface IFormikField {
  name: string
  placeholder?: string
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
  focus?: boolean
  readOnly?: boolean
}
