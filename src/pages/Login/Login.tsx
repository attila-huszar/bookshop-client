import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Form, Formik } from 'formik'
import { login } from '@/store/thunks/user'
import { toast } from '@/components/AppToaster'
import { AuthorizationMenu } from '@/components/AuthorizationMenu'
import { Button, IconButton } from '@/components/Button'
import { ForgotPassword } from '@/components/ForgotPassword'
import { FormikField } from '@/components/FormikField'
import { useAppDispatch } from '@/hooks/redux'
import { getErrorMessage } from '@/helpers/errors'
import { scrollToTop } from '@/helpers/scrollToTop'
import { loginSchema } from '@/validation/userSchemas'
import { loginInitialValues } from '@/constants/defaultValues'
import type { LoginRequest } from '@/types'
import { BackIcon, QuestionIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles/form.styles'

export function Login() {
  const { t, i18n } = useTranslation()

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)
  const lifecycleRef = useRef<{ active: boolean } | null>(null)

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle
    scrollToTop()

    return () => {
      lifecycle.active = false
    }
  }, [])

  const handleSubmit = async (values: LoginRequest) => {
    const lifecycle = lifecycleRef.current

    if (!lifecycle?.active) {
      return
    }

    try {
      const { firstName } = await dispatch(login(values)).unwrap()

      if (!lifecycle.active) {
        return
      }

      toast.success(i18n.t('auth.welcome', { name: firstName }))
      void navigate('/', { replace: true })
    } catch (error) {
      if (lifecycle.active) {
        toast.error(getErrorMessage(error, i18n.t('auth.loginError')))
      }
    }
  }

  const handleDialogOpen = () => {
    forgotPasswordDialog.current?.showModal()
  }

  return (
    <AuthorizationMenu>
      <Formik<LoginRequest>
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>
              <label htmlFor="login-email">{t('common.fields.email')}</label>
            </p>
            <FormikField
              id="login-email"
              name="email"
              placeholder={t('common.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="username"
              disabled={isSubmitting}
              autoFocus
            />
            <p>
              <label htmlFor="login-password">
                {t('common.fields.password')}
              </label>
            </p>
            <FormikField
              id="login-password"
              name="password"
              placeholder={t('common.fields.password')}
              type={showPassword ? 'text' : 'password'}
              inputMode="text"
              autoComplete="current-password"
              disabled={isSubmitting}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="button"
                title={t('common.actions.back')}
                disabled={isSubmitting}
                onClick={() => void navigate('/')}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <SpinnerIcon height={28} />}
                {t('auth.login')}
              </Button>
              <IconButton
                icon={<QuestionIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="button"
                title={t('auth.forgotPassword')}
                disabled={isSubmitting}
                onClick={handleDialogOpen}
              />
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
      <ForgotPassword ref={forgotPasswordDialog} />
    </AuthorizationMenu>
  )
}
