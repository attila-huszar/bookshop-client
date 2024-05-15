export interface IFormikField {
  name: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
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
  children?: React.ReactNode
}
