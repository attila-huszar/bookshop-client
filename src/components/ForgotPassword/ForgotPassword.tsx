import { useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Formik } from 'formik'
import { postPasswordReset } from '@/api/users'
import { toast } from '@/components/AppToaster'
import { Button, IconButton } from '@/components/Button'
import { FormikField } from '@/components/FormikField'
import { useClickOutside } from '@/hooks/useClickOutside'
import { getErrorMessage } from '@/helpers/errors'
import { forgotPasswordSchema } from '@/validation/userSchemas'
import { BackIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles/form.styles'
import { StyledForgotPassword } from './ForgotPassword.style'

type PasswordDialogHandle = {
  showModal: () => void
  close: () => void
}

type Props = { ref: React.Ref<PasswordDialogHandle> }

export function ForgotPassword({ ref }: Props) {
  const { t } = useTranslation()

  const forgotPassRef = useRef<HTMLDialogElement>(null)

  useImperativeHandle(ref, () => ({
    showModal: () => forgotPassRef.current?.showModal(),
    close: () => forgotPassRef.current?.close(),
  }))

  const handleClose = () => {
    forgotPassRef.current?.close()
  }

  useClickOutside(forgotPassRef, handleClose)

  const handleSubmit = async (
    values: {
      email: string
    },
    actions: { resetForm: () => void },
  ) => {
    try {
      await postPasswordReset(values.email)

      toast.success(t('auth.resetSent'), {
        id: 'passwordReset',
      })

      handleClose()
      actions.resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, t('auth.resetError')), {
        id: 'passwordReset',
      })
    }
  }

  return (
    <StyledForgotPassword ref={forgotPassRef} onCancel={handleClose}>
      <h2>{t('auth.forgotPasswordTitle')}</h2>
      <p>{t('auth.resetHelp')}</p>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={forgotPasswordSchema}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>{t('common.fields.email')}</p>
            <FormikField
              name="email"
              placeholder={t('common.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="reset"
                title={t('common.actions.back')}
                disabled={isSubmitting}
                onClick={handleClose}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <SpinnerIcon height={28} />}
                {t('auth.sendEmail')}
              </Button>
              <div style={{ width: '3rem' }} />
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledForgotPassword>
  )
}
