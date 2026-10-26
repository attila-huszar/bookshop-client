import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { Form, Formik } from 'formik'
import { postPasswordResetSubmit, postVerifyPasswordReset } from '@/api/users'
import { ROUTE } from '@/routes/route'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { FormikField } from '@/components/FormikField'
import { Loading } from '@/components/Loading'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import { resetPasswordSchema } from '@/validation/userSchemas'
import { passwordResetInitialValues } from '@/constants/defaultValues'
import { AuthErrorCode } from '@/types/ApiError'
import { SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles/form.styles'
import { StyledPasswordReset } from './PasswordReset.style'

export function PasswordReset() {
  const { search } = useLocation()
  const token = new URLSearchParams(search).get('token')

  // Each email link starts with fresh form and verification state.
  return <PasswordResetForm key={token} token={token} />
}

function PasswordResetForm({ token }: { token: string | null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const lifecycleRef = useRef<{ active: boolean } | null>(null)

  useEffect(() => {
    if (!token) {
      toast.error(i18n.t('auth.invalidResetToken'))
      void navigate(ROUTE.HOME, { replace: true })

      return
    }

    // Submission callbacks also need to know when this effect has been cleaned up.
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    void postVerifyPasswordReset(token).then(
      () => {
        if (!lifecycle.active) {
          return
        }

        setIsVerified(true)

        toast.success(i18n.t('auth.enterNewPassword'))
      },
      (error: unknown) => {
        if (!lifecycle.active) {
          return
        }

        toast.error(getErrorMessage(error, i18n.t('auth.resetError')))

        void navigate(ROUTE.HOME, { replace: true })
      },
    )

    return () => {
      lifecycle.active = false
    }
  }, [navigate, token])

  const handleSubmit = async (values: typeof passwordResetInitialValues) => {
    const lifecycle = lifecycleRef.current

    if (!token || !isVerified || !lifecycle?.active) {
      toast.error(t('auth.expiredToken'))

      return
    }

    try {
      await postPasswordResetSubmit(token, values.newPassword)

      if (!lifecycle.active) {
        return
      }

      toast.success(i18n.t('auth.passwordChanged'))

      void navigate(`/${ROUTE.LOGIN}`, { replace: true })
    } catch (error) {
      if (!lifecycle.active) {
        return
      }

      toast.error(getErrorMessage(error, i18n.t('auth.passwordChangeError')))

      if (getApiError(error)?.code === AuthErrorCode.InvalidToken) {
        void navigate(`/${ROUTE.LOGIN}`, { replace: true })
      }
    }
  }

  if (!token) {
    return null
  }

  if (!isVerified) {
    return <Loading message={t('auth.verifying')} fullScreen />
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
            <p>
              <label htmlFor="new-password">{t('auth.newPassword')}</label>
            </p>
            <FormikField
              id="new-password"
              name="newPassword"
              placeholder={t('auth.newPassword')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              disabled={isSubmitting}
              autoFocus
            />
            <p>
              <label htmlFor="confirm-new-password">
                {t('auth.confirmNewPassword')}
              </label>
            </p>
            <FormikField
              id="confirm-new-password"
              name="newPasswordConfirmation"
              placeholder={t('auth.confirmNewPassword')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              disabled={isSubmitting}
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
