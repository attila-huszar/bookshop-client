import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { ButtonWrapper } from '@/styles/Form.style'
import {
  AuthorizationMenu,
  FormikField,
  Button,
  IconButton,
} from '@/components'
import { ForgotPasswordRef } from './components/ForgotPassword/ForgotPassword'
import { loginSchema } from '@/helpers'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { login, userSelector } from '@/store'
import { loginInitialValues } from '@/constants'
import type { UserLogin } from '@/types'
import BackIcon from '@/assets/svg/chevron_left_circle.svg?react'
import QuestionIcon from '@/assets/svg/question_circle.svg?react'

export function Login() {
  const { userIsLoading } = useAppSelector(userSelector)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleLogin = async (user: UserLogin) => {
    try {
      const response = await dispatch(login(user)).unwrap()
      await navigate('/', { replace: true })
      toast.success(`Welcome back, ${response.firstName}!`, {
        id: 'login-success',
      })
    } catch (error) {
      toast.error(String(error), {
        id: 'login-error',
      })
    }
  }

  const handleDialogOpen = () => {
    forgotPasswordDialog.current?.showModal()
  }

  const navigateToHome = async () => {
    await navigate('/')
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        validateOnBlur={false}
        onSubmit={handleLogin}>
        <Form noValidate>
          <p>Email</p>
          <FormikField
            name="email"
            placeholder="Email"
            type="email"
            inputMode="email"
            focus
          />
          <p>Password</p>
          <FormikField
            name="password"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          <ButtonWrapper>
            <IconButton
              icon={<BackIcon />}
              $iconSize="lg"
              $color="var(--mid-grey)"
              type="reset"
              title="Back"
              disabled={userIsLoading}
              onClick={() => void navigateToHome()}
            />
            <Button type="submit" disabled={userIsLoading}>
              {userIsLoading ? 'Logging in...' : 'Login'}
            </Button>
            <IconButton
              icon={<QuestionIcon />}
              $iconSize="lg"
              $color="var(--mid-grey)"
              type="button"
              title="Forgot Password?"
              disabled={userIsLoading}
              onClick={handleDialogOpen}
            />
          </ButtonWrapper>
        </Form>
      </Formik>
      <ForgotPasswordRef ref={forgotPasswordDialog} />
    </AuthorizationMenu>
  )
}
