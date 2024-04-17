import { FieldInputProps, FormikProps, FieldMetaProps } from 'formik'

export type RegistrationTypes = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  $valid: boolean
  $error: string | false | undefined
}

export interface IFormikField {
  field: FieldInputProps<string>
  form?: FormikProps<string>
  meta: FieldMetaProps<string>
  type?: string
  placeholder: string
  inputMode?: string
}
