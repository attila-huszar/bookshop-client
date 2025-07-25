import { useEffect, useRef } from 'react'
import { Field, useFormikContext } from 'formik'
import {
  InputWrapper,
  Input,
  Select,
  ErrorMessage,
  PasswordEye,
} from '@/styles'
import type { FormikProps, FormikInput } from '@/types'
import { EyeIcon, EyeHideIcon } from '@/assets/svg'

export function FormikField({
  name,
  value,
  onChange,
  placeholder,
  type,
  inputMode,
  focus,
  readOnly,
  autoComplete,
  children,
  showPassword,
  setShowPassword,
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

  if (type === 'file') {
    const fileMeta = formikContext.getFieldMeta(name)
    const shouldShowError = fileMeta.touched && formikContext.submitCount > 0

    return (
      <InputWrapper>
        <Input
          name={name}
          aria-label={name}
          onChange={handleImgChange}
          type="file"
          accept="image/*"
          readOnly={readOnly}
          $valid={shouldShowError && !fileMeta.error}
          $error={shouldShowError && fileMeta.error}
        />
        {shouldShowError && fileMeta.error && (
          <ErrorMessage>{fileMeta.error}</ErrorMessage>
        )}
      </InputWrapper>
    )
  }

  if (type === 'select') {
    return (
      <Field name={name} value={value} onChange={onChange}>
        {({ field, form, meta }: FormikProps) => {
          const shouldShowError = meta.touched && form.submitCount > 0

          return (
            <InputWrapper>
              <Select
                disabled={readOnly}
                $valid={shouldShowError && !meta.error}
                $error={shouldShowError && meta.error}
                {...field}>
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

  if (type === 'checkbox') {
    return <Field type="checkbox" name={name} />
  }

  return (
    <Field name={name} value={value} onChange={onChange}>
      {({ field, form, meta }: FormikProps) => {
        const shouldShowError = meta.touched && form.submitCount > 0

        return (
          <InputWrapper>
            <Input
              $valid={shouldShowError && !meta.error}
              $error={shouldShowError && meta.error}
              placeholder={placeholder}
              type={type}
              inputMode={inputMode}
              ref={formikRef}
              readOnly={readOnly}
              autoComplete={autoComplete}
              {...field}
            />
            {/password/i.test(name) && (
              <PasswordEye
                type="button"
                onClick={() => setShowPassword?.((prev) => !prev)}>
                {showPassword ? <EyeHideIcon /> : <EyeIcon />}
              </PasswordEye>
            )}
            {shouldShowError && meta.error && (
              <ErrorMessage $passwordError={/password/i.test(name)}>
                {meta.error}
              </ErrorMessage>
            )}
          </InputWrapper>
        )
      }}
    </Field>
  )
}
