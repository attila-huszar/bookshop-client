import { useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Field,
  type FieldProps,
  FormikContext,
  type FormikContextType,
  useFormikContext,
} from 'formik'
import { IMAGE_ACCEPT } from '@/validation/fileSchemas'
import type { FormikInput } from '@/types'
import { EyeHideIcon, EyeIcon } from '@/assets/svg'
import {
  ErrorMessage,
  Input,
  InputWrapper,
  PasswordEye,
  Select,
  Textarea,
} from '@/styles/form.styles'

export function FormikField({
  children,
  showPassword,
  setShowPassword,
  ...props
}: FormikInput) {
  const { t, i18n } = useTranslation()
  const formik = useContext(FormikContext) as
    FormikContextType<unknown> | undefined
  const previousLanguage = useRef(i18n.resolvedLanguage)

  useEffect(() => {
    if (previousLanguage.current === i18n.resolvedLanguage) {
      return
    }

    previousLanguage.current = i18n.resolvedLanguage

    if (formik && props.name) {
      const meta = formik.getFieldMeta(props.name)

      if (meta.error && (meta.touched || formik.submitCount > 0)) {
        void formik.validateField(props.name)
      }
    }
  }, [formik, i18n.resolvedLanguage, props.name])

  if (props.type === 'file' && props.name) {
    return <FileField {...props} name={props.name} />
  }

  if (props.type === 'select') {
    return (
      <Field {...props}>
        {({ field, form, meta }: FieldProps<string>) => {
          const shouldShowError = meta.touched && form.submitCount > 0

          return (
            <InputWrapper>
              <Select
                {...field}
                {...props}
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
        {({ field, form, meta }: FieldProps<string>) => {
          const shouldShowError = meta.touched && form.submitCount > 0

          return (
            <InputWrapper>
              <Textarea
                {...field}
                {...props}
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

  const renderInput = (fieldProps?: FieldProps<string>) => {
    const error = fieldProps?.meta.error
    const shouldShowError =
      fieldProps?.meta.touched && fieldProps.form.submitCount > 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <InputWrapper>
          <Input
            {...fieldProps?.field}
            {...props}
            $valid={shouldShowError && !error}
            $error={shouldShowError && error}
          />
          {showPassword !== undefined && (
            <PasswordEye
              type="button"
              aria-label={
                showPassword ? t('auth.hidePassword') : t('auth.showPassword')
              }
              onClick={() => setShowPassword?.((prev) => !prev)}>
              {showPassword ? <EyeHideIcon /> : <EyeIcon />}
            </PasswordEye>
          )}
        </InputWrapper>
        {shouldShowError && error && <ErrorMessage>{error}</ErrorMessage>}
      </div>
    )
  }

  return props.name ? <Field {...props}>{renderInput}</Field> : renderInput()
}

function FileField(props: FormikInput & { name: string }) {
  const formikContext = useFormikContext()
  const fileMeta = formikContext.getFieldMeta(props.name)
  const shouldShowError = fileMeta.touched && formikContext.submitCount > 0

  const handleImgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void formikContext.setFieldValue(
      'avatar',
      event.target.files instanceof FileList ? event.target.files[0] : null,
    )

    void formikContext.setFieldTouched('avatar', true)
    void formikContext.validateField('avatar')
  }

  return (
    <InputWrapper>
      <Input
        aria-label={props.name}
        onChange={handleImgChange}
        type="file"
        accept={IMAGE_ACCEPT}
        {...props}
        $valid={shouldShowError && !fileMeta.error}
        $error={shouldShowError && fileMeta.error}
      />
      {shouldShowError && fileMeta.error && (
        <ErrorMessage>{fileMeta.error}</ErrorMessage>
      )}
    </InputWrapper>
  )
}
