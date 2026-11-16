import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Form, Formik } from 'formik'
import { ROUTE } from '@/routes/route'
import { googleLogin, login } from '@/store/thunks/auth'
import { toast } from '@/components/AppToaster'
import { AuthorizationMenu } from '@/components/AuthorizationMenu'
import { Button, IconButton } from '@/components/Button'
import { ForgotPassword } from '@/components/ForgotPassword'
import { FormikField } from '@/components/FormikField'
import { GoogleSignIn } from '@/components/GoogleSignIn/GoogleSignIn'
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
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const pendingLogin = useRef(false)
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

    if (!lifecycle?.active || pendingLogin.current) {
      return
    }

    pendingLogin.current = true
    setIsLoggingIn(true)

    try {
      const { firstName } = await dispatch(login(values)).unwrap()

      if (!lifecycle.active) {
        return
      }

      toast.success(i18n.t('auth.welcome', { name: firstName }))
      void navigate(ROUTE.HOME, { replace: true })
    } catch (error) {
      if (lifecycle.active) {
        toast.error(getErrorMessage(error, i18n.t('auth.loginError')))
      }
    } finally {
      pendingLogin.current = false

      if (lifecycle.active) {
        setIsLoggingIn(false)
      }
    }
  }

  const handleGoogleSignIn = async (credential: string) => {
    const lifecycle = lifecycleRef.current

    if (!lifecycle?.active || pendingLogin.current) {
      return
    }

    pendingLogin.current = true
    setIsLoggingIn(true)

    try {
      const { firstName } = await dispatch(googleLogin(credential)).unwrap()

      if (!lifecycle.active) {
        return
      }

      toast.success(i18n.t('auth.welcome', { name: firstName }))
      void navigate(ROUTE.HOME, { replace: true })
    } catch (error) {
      if (lifecycle.active) {
        toast.error(getErrorMessage(error, i18n.t('auth.loginError')))
      }
    } finally {
      pendingLogin.current = false

      if (lifecycle.active) {
        setIsLoggingIn(false)
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
            disabled={isLoggingIn}
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
            disabled={isLoggingIn}
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
              disabled={isLoggingIn}
              onClick={() => void navigate(ROUTE.HOME)}
            />
            <Button type="submit" disabled={isLoggingIn}>
              {isLoggingIn && <SpinnerIcon height={28} />}
              {t('auth.login')}
            </Button>
            <IconButton
              icon={<QuestionIcon />}
              $size="lg"
              $color="var(--color-outline)"
              type="button"
              title={t('auth.forgotPassword')}
              disabled={isLoggingIn}
              onClick={handleDialogOpen}
            />
          </ButtonWrapper>
        </Form>
      </Formik>
      <GoogleSignIn disabled={isLoggingIn} onCredential={handleGoogleSignIn} />
      <ForgotPassword ref={forgotPasswordDialog} />
    </AuthorizationMenu>
  )
}
