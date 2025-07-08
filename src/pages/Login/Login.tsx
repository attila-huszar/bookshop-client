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
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import { loginSchema } from '@/helpers'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { fetchUserProfile, login, userSelector } from '@/store'
import { loginInitialValues } from '@/constants'
import type { LoginRequest } from '@/types'
import { BackIcon, QuestionIcon, SpinnerIcon } from '@/assets/svg'

export function Login() {
  const { userIsLoading, loginError } = useAppSelector(userSelector)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values: LoginRequest) => {
    const result = await dispatch(login(values))

    if (result.meta.requestStatus === 'fulfilled') {
      const user = await dispatch(fetchUserProfile()).unwrap()
      toast.success(`Welcome back, ${user.firstName}!`)
      await navigate('/', { replace: true })
    } else {
      toast.error(loginError ?? 'Login failed. Please try again.')
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
              $iconSize="lg"
              $color="var(--mid-grey)"
              type="reset"
              title="Back"
              disabled={userIsLoading}
              onClick={() => void navigate('/')}
            />
            <Button type="submit" disabled={userIsLoading}>
              {userIsLoading ? <SpinnerIcon height={28} /> : 'Login'}
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
      <ForgotPassword ref={forgotPasswordDialog} />
    </AuthorizationMenu>
  )
}
