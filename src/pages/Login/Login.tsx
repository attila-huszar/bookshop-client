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
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    scrollToTop()
  }, [])

  const handleSubmit = async (values: LoginRequest) => {
    try {
      const { firstName } = await dispatch(login(values)).unwrap()
      toast.success(t('auth.welcome', { name: firstName }))
      void navigate('/', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, t('auth.loginError')))
    }
  }

  const handleDialogOpen = () => {
    forgotPasswordDialog.current?.showModal()
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>{t('common.fields.email')}</p>
            <FormikField
              name="email"
              placeholder={t('common.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="username"
              autoFocus
            />
            <p>{t('common.fields.password')}</p>
            <FormikField
              name="password"
              placeholder={t('common.fields.password')}
              type={showPassword ? 'text' : 'password'}
              inputMode="text"
              autoComplete="current-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="reset"
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
