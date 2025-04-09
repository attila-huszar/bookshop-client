import type { FieldInputProps, FieldMetaProps, FormikState } from 'formik'

export type FormikProps = {
  field: FieldInputProps<string>
  form: FormikState<string>
  meta: FieldMetaProps<string>
}

export type FormikInput = {
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
  showPassword?: boolean
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>
}
