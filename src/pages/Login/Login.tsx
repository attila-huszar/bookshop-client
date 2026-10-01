import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Form, Formik } from 'formik'
import { fetchUserProfile, login } from '@/store'
import {
  AuthorizationMenu,
  Button,
  ForgotPassword,
  FormikField,
  IconButton,
  toast,
} from '@/components'
import { useAppDispatch } from '@/hooks'
import { getErrorMessage, scrollToTop } from '@/helpers'
import { loginSchema } from '@/validation'
import { loginInitialValues } from '@/constants'
import type { LoginRequest } from '@/types'
import { BackIcon, QuestionIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    scrollToTop()
  }, [])

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await dispatch(login(values)).unwrap()
      const { firstName } = await dispatch(fetchUserProfile()).unwrap()
      toast.success(`Welcome back, ${firstName}!`)
      void navigate('/', { replace: true })
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Login failed, please try again later'),
      )
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
            <p>Email</p>
            <FormikField
              name="email"
              placeholder="Email"
              type="email"
              inputMode="email"
              autoComplete="username"
              focus
            />
            <p>Password</p>
            <FormikField
              name="password"
              placeholder="Password"
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
                $color="var(--mid-grey)"
                type="reset"
                title="Back"
                disabled={isSubmitting}
                onClick={() => void navigate('/')}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <SpinnerIcon height={28} />} Login
              </Button>
              <IconButton
                icon={<QuestionIcon />}
                $size="lg"
                $color="var(--mid-grey)"
                type="button"
                title="Forgot Password?"
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
