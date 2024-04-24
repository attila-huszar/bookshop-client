import { useEffect, useRef } from 'react'
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  FormikState,
  useFormikContext,
} from 'formik'
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
  const formikContext = useFormikContext()

  useEffect(() => {
    if (focus && formikRef.current) {
      formikRef.current.focus()
    }
  }, [focus, formikRef])

  const handleImgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formikContext.setFieldValue(
      'avatar',
      event.target.files instanceof FileList ? event.target.files[0] : null,
    )

    formikContext.setFieldTouched('avatar', true)
    formikContext.validateField('avatar')
  }

  if (type === 'file') {
    const fileMeta = formikContext.getFieldMeta(name)

    return (
      <InputWrapper>
        <Input
          name={name}
          type="file"
          accept="image/*"
          onChange={handleImgChange}
          $valid={
            fileMeta.touched && !fileMeta.error && formikContext.submitCount > 0
          }
          $error={
            fileMeta.touched && fileMeta.error && formikContext.submitCount > 0
          }
        />
        {fileMeta.touched &&
          fileMeta.error &&
          formikContext.submitCount > 0 && (
            <ErrorMessage>{fileMeta.error}</ErrorMessage>
          )}
      </InputWrapper>
    )
  }

  return (
    <Field name={name}>
      {({
        field,
        form,
        meta,
      }: {
        field: FieldInputProps<string>
        form: FormikState<string>
        meta: FieldMetaProps<string>
      }) => (
        <InputWrapper>
          <Input
            $valid={meta.touched && !meta.error && form.submitCount > 0}
            $error={meta.touched && meta.error && form.submitCount > 0}
            placeholder={placeholder}
            type={type}
            inputMode={inputMode}
            ref={formikRef}
            {...field}
          />
          {meta.touched && meta.error && form.submitCount > 0 && (
            <ErrorMessage>{meta.error}</ErrorMessage>
          )}
        </InputWrapper>
      )}
    </Field>
  )
}
