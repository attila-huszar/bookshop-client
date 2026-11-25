import { useContext, useEffect, useId, useRef } from 'react'
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

export function FormikField(input: FormikInput) {
  const { children, label, showPassword, setShowPassword, ...props } = input
  const generatedId = useId()
  const id = props.id ?? generatedId
  const errorId = `${id}-error`

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

  const renderControl = () => {
    if (props.type === 'file' && props.name) {
      return (
        <FileField
          {...props}
          id={id}
          name={props.name}
          aria-label={
            props['aria-label'] ??
            (label || props.id || props['aria-labelledby']
              ? undefined
              : props.name)
          }
        />
      )
    }

    if (props.type === 'select' || props.type === 'textarea') {
      const Control = props.type === 'select' ? Select : Textarea

      return (
        <Field {...props}>
          {({ field, form, meta }: FieldProps<string>) => {
            const shouldShowError = meta.touched && form.submitCount > 0
            const error = shouldShowError ? meta.error : undefined

            return (
              <InputWrapper>
                <Control
                  {...field}
                  {...props}
                  id={id}
                  {...describeError(error, errorId, props['aria-describedby'])}
                  $valid={shouldShowError && !error}
                  $error={error}>
                  {children}
                </Control>
                {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
              </InputWrapper>
            )
          }}
        </Field>
      )
    }

    if (props.type === 'checkbox') {
      return <Field type="checkbox" {...props} id={id} />
    }

    const renderInput = (fieldProps?: FieldProps<string>) => {
      const shouldShowError =
        fieldProps?.meta.touched && fieldProps.form.submitCount > 0
      const error = shouldShowError ? fieldProps?.meta.error : undefined

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InputWrapper>
            <Input
              {...fieldProps?.field}
              {...props}
              id={id}
              {...describeError(error, errorId, props['aria-describedby'])}
              $valid={shouldShowError && !error}
              $error={error}
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
          {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
        </div>
      )
    }

    return props.name ? <Field {...props}>{renderInput}</Field> : renderInput()
  }

  return (
    <>
      {label && (
        <p>
          <label htmlFor={id}>{label}</label>
        </p>
      )}
      {renderControl()}
    </>
  )
}

function describeError(
  error: string | undefined,
  id: string,
  description: string | undefined,
) {
  if (error) {
    return {
      'aria-invalid': true,
      'aria-describedby': description ? `${description} ${id}` : id,
    }
  }
}

function FileField(props: FormikInput & { id: string; name: string }) {
  const formikContext = useFormikContext()
  const fileMeta = formikContext.getFieldMeta(props.name)
  const shouldShowError = fileMeta.touched && formikContext.submitCount > 0
  const error = shouldShowError ? fileMeta.error : undefined
  const errorId = `${props.id}-error`

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
        onChange={handleImgChange}
        type="file"
        accept={IMAGE_ACCEPT}
        {...props}
        {...describeError(error, errorId, props['aria-describedby'])}
        $valid={shouldShowError && !error}
        $error={error}
      />
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </InputWrapper>
  )
}
