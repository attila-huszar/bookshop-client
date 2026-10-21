import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { Form, Formik } from 'formik'
import { postPasswordResetSubmit, postVerifyPasswordReset } from '@/api/users'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { FormikField } from '@/components/FormikField'
import { Loading } from '@/components/Loading'
import { getErrorMessage } from '@/helpers/errors'
import { resetPasswordSchema } from '@/validation/userSchemas'
import { passwordResetInitialValues } from '@/constants/defaultValues'
import { SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles/form.styles'
import { StyledPasswordReset } from './PasswordReset.style'

type PasswordResetVerification =
  | { status: 'verifying' }
  | { status: 'ready'; token: string }
  | { status: 'invalid' }

export function PasswordReset() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const tokenParam = queryParams.get('token')
  const [verification, setVerification] = useState<PasswordResetVerification>(
    () => (tokenParam ? { status: 'verifying' } : { status: 'invalid' }),
  )
  const [showPassword, setShowPassword] = useState(false)
  const hasVerified = useRef(false)

  useEffect(() => {
    if (!tokenParam) {
      toast.error(i18n.t('auth.invalidResetToken'))
      void navigate('/', { replace: true })
      return
    }

    if (hasVerified.current) return

    hasVerified.current = true

    const verifyToken = async () => {
      try {
        const response = await postVerifyPasswordReset(tokenParam)
        setVerification({ status: 'ready', token: response.token })

        toast.success(i18n.t('auth.enterNewPassword'))
      } catch (error) {
        setVerification({ status: 'invalid' })
        toast.error(getErrorMessage(error, i18n.t('auth.resetError')))

        void navigate('/', { replace: true })
      }
    }

    void verifyToken()
  }, [tokenParam, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    if (verification.status !== 'ready') {
      toast.error(t('auth.expiredToken'))
      return
    }

    if (values.newPassword !== values.newPasswordConfirmation) {
      toast.error(t('auth.passwordMismatch'))
      return
    }

    try {
      await postPasswordResetSubmit(verification.token, values.newPassword)
      toast.success(t('auth.passwordChanged'))

      void navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, t('auth.passwordChangeError')))
    }
  }

  if (verification.status === 'verifying') {
    return <Loading message={t('auth.verifying')} fullScreen />
  }

  if (verification.status === 'invalid') {
    return null
  }

  return (
    <StyledPasswordReset>
      <h2>{t('auth.passwordReset')}</h2>
      <p>{t('auth.passwordResetHelp')}</p>
      <Formik
        initialValues={passwordResetInitialValues}
        validationSchema={resetPasswordSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>{t('auth.newPassword')}</p>
            <FormikField
              name="newPassword"
              placeholder={t('auth.newPassword')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <p>{t('auth.confirmNewPassword')}</p>
            <FormikField
              name="newPasswordConfirmation"
              placeholder={t('auth.confirmNewPassword')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <ButtonWrapper>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <SpinnerIcon height={28} />}
                {t('common.actions.submit')}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledPasswordReset>
  )
}
