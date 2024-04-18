import { Field, FieldInputProps, FieldMetaProps } from 'formik'
import { InputWrapper, Input, ErrorMessage } from './Registration.styles'
import { IFormikField } from './Registration.types'

export function FieldCustomStyle({
  name,
  placeholder,
  type,
  inputMode,
}: IFormikField) {
  return (
    <Field name={name}>
      {({
        field,
        meta,
      }: {
        field: FieldInputProps<string>
        meta: FieldMetaProps<string>
      }) => (
        <InputWrapper>
          <Input
            $valid={meta.touched && !meta.error}
            $error={meta.touched && meta.error}
            placeholder={placeholder}
            type={type}
            inputMode={inputMode}
            {...field}
          />
          {meta.touched && meta.error && (
            <ErrorMessage>{meta.error}</ErrorMessage>
          )}
        </InputWrapper>
      )}
    </Field>
  )
}
