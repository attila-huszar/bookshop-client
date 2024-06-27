import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { ButtonWrapper } from 'styles/Form.styles'
import { AuthorizationMenu, FormikField, Button, IconButton } from 'components'
import { ForgotPasswordRef } from './components/ForgotPassword/ForgotPassword'
import { loginSchema } from 'helpers'
import { useAppDispatch, useLocalStorage } from 'hooks'
import { loginUser } from 'store'
import { loginInitialValues } from 'lib'
import { IUserToStore } from 'interfaces'
import toast from 'react-hot-toast'
import BackIcon from 'assets/svg/chevron_left_circle.svg?react'
import QuestionIcon from 'assets/svg/question_circle.svg?react'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()
  const [showPassword, setShowPassword] = useState(false)
  const forgotPasswordDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values: { email: string; password: string }) => {
    const user = {
      email: values.email,
      password: values.password,
    }

    try {
      const loginResponse = await dispatch(loginUser(user))

      if (loginResponse.type.includes('fulfilled')) {
        navigate('/', { replace: true })
        toast.success(
          `Welcome back, ${(loginResponse.payload as IUserToStore).firstName}!`,
        )

        setToLocalStorage('uuid', (loginResponse.payload as IUserToStore).uuid)
      } else if (loginResponse.type.includes('rejected')) {
        toast.error(loginResponse.payload as string, {
          id: 'login-error',
        })
      }
    } catch (error) {
      toast.error(error as string)
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
        onSubmit={(values) => handleSubmit(values)}>
        {({ isSubmitting }) => (
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
                disabled={isSubmitting}
                onClick={() => navigate('/')}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
              <IconButton
                icon={<QuestionIcon />}
                $iconSize="lg"
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
      <ForgotPasswordRef ref={forgotPasswordDialog} />
    </AuthorizationMenu>
  )
}
