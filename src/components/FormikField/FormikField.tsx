import { useEffect, useRef } from 'react'
import { Field, useFormikContext } from 'formik'
import {
  InputWrapper,
  Input,
  Select,
  ErrorMessage,
  PasswordEye,
  Textarea,
} from '@/styles'
import type { FormikProps, FormikInput } from '@/types'
import { EyeIcon, EyeHideIcon } from '@/assets/svg'

export function FormikField({
  focus,
  children,
  showPassword,
  setShowPassword,
  ...props
}: FormikInput) {
  const formikRef = useRef<HTMLInputElement>(null)
  const formikContext = useFormikContext()

  useEffect(() => {
    if (focus && formikRef.current) {
      formikRef.current.focus()
    }
  }, [focus, formikRef])

  const handleImgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void formikContext.setFieldValue(
      'avatar',
      event.target.files instanceof FileList ? event.target.files[0] : null,
    )

    void formikContext.setFieldTouched('avatar', true)
    void formikContext.validateField('avatar')
  }

  if (props.type === 'file' && props.name) {
    const fileMeta = formikContext.getFieldMeta(props.name)
    const shouldShowError = fileMeta.touched && formikContext.submitCount > 0

    return (
      <InputWrapper>
        <Input
          aria-label={props.name}
          onChange={handleImgChange}
          type="file"
          accept="image/*"
          {...props}
          disabled={props.disabled ?? props.readOnly ?? false}
          $valid={shouldShowError && !fileMeta.error}
          $error={shouldShowError && fileMeta.error}
        />
        {shouldShowError && fileMeta.error && (
          <ErrorMessage>{fileMeta.error}</ErrorMessage>
        )}
      </InputWrapper>
    )
  }

  if (props.type === 'select') {
    return (
      <Field {...props}>
        {({ field, form, meta }: FormikProps) => {
          const shouldShowError = meta.touched && form.submitCount > 0

          return (
            <InputWrapper>
              <Select
                {...field}
                {...props}
                disabled={props.disabled ?? props.readOnly ?? false}
                $valid={shouldShowError && !meta.error}
                $error={shouldShowError && meta.error}>
                {children}
              </Select>
              {shouldShowError && meta.error && (
                <ErrorMessage>{meta.error}</ErrorMessage>
              )}
            </InputWrapper>
          )
        }}
      </Field>
    )
  }

  if (props.type === 'checkbox') {
    return <Field type="checkbox" {...props} />
  }

  if (props.type === 'textarea') {
    return (
      <Field {...props}>
        {({ field, form, meta }: FormikProps) => {
          const shouldShowError = meta.touched && form.submitCount > 0

          return (
            <InputWrapper>
              <Textarea
                {...field}
                {...props}
                disabled={props.disabled ?? props.readOnly ?? false}
                $valid={shouldShowError && !meta.error}
                $error={shouldShowError && meta.error}>
                {children}
              </Textarea>
              {shouldShowError && meta.error && (
                <ErrorMessage>{meta.error}</ErrorMessage>
              )}
            </InputWrapper>
          )
        }}
      </Field>
    )
  }

  return (
    <Field {...props}>
      {({ field, form, meta }: FormikProps) => {
        const shouldShowError = meta.touched && form.submitCount > 0

        return (
          <InputWrapper>
            <Input
              ref={formikRef}
              {...field}
              {...props}
              disabled={props.disabled ?? props.readOnly ?? false}
              $valid={shouldShowError && !meta.error}
              $error={shouldShowError && meta.error}
            />
            {!!props.name && /password/i.test(props.name) && (
              <PasswordEye
                type="button"
                onClick={() => setShowPassword?.((prev) => !prev)}>
                {showPassword ? <EyeHideIcon /> : <EyeIcon />}
              </PasswordEye>
            )}
            {shouldShowError && meta.error && (
              <ErrorMessage
                $passwordError={!!props.name && /password/i.test(props.name)}>
                {meta.error}
              </ErrorMessage>
            )}
          </InputWrapper>
        )
      }}
    </Field>
  )
}
