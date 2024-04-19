import { useEffect, useRef } from 'react'
import { Field, FieldInputProps, FieldMetaProps } from 'formik'
import { InputWrapper, Input, ErrorMessage } from '../../styles/Form.styles'
import { IFormikField } from '../../interfaces'

export function FormikField({
  name,
  placeholder,
  type,
  inputMode,
  focus,
}: IFormikField) {
  const formikRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focus && formikRef.current) {
      formikRef.current.focus()
    }
  }, [focus, formikRef])

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
            ref={formikRef}
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
