import type { FieldInputProps, FieldMetaProps, FormikState } from 'formik'

export type FormikProps = {
  field: FieldInputProps<string>
  form: FormikState<string>
  meta: FieldMetaProps<string>
}

export type FormikInput = {
  showPassword?: boolean
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>
  focus?: boolean
} & React.PropsWithChildren &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > &
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
