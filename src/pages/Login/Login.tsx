import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { ButtonWrapper } from 'styles/Form.styles'
import { AuthorizationMenu, FormikField, Button, IconButton } from 'components'
import { ForgotPasswordRef } from './components/ForgotPassword/ForgotPassword'
import { loginSchema } from 'helpers'
import { useAppDispatch, useAppSelector, useLocalStorage } from 'hooks'
import { loginUser, userSelector } from 'store'
import { loginInitialValues } from 'lib'
import toast from 'react-hot-toast'
import BackIcon from 'assets/svg/chevron_left_circle.svg?react'
import QuestionIcon from 'assets/svg/question_circle.svg?react'

export function Login() {
  const { userData, userIsLoading, loginError } = useAppSelector(userSelector)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (userData) {
      setToLocalStorage('uuid', userData.uuid)
      navigate('/', { replace: true })
      toast.success(`Welcome back, ${userData.firstName}!`, {
        id: 'login-success',
      })
    } else if (loginError) {
      toast.error(`${loginError}`, {
        id: 'login-error',
      })
    }
  }, [loginError, navigate, setToLocalStorage, userData])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleDialogOpen = () => {
    forgotPasswordDialog.current?.showModal()
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        validateOnBlur={false}
        onSubmit={(user) => dispatch(loginUser(user))}>
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
              onClick={() => navigate('/')}
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
