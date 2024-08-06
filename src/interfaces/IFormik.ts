import type { FieldInputProps, FieldMetaProps, FormikState } from 'formik'

export interface IFormik {
  field: FieldInputProps<string>
  form: FormikState<string>
  meta: FieldMetaProps<string>
}
