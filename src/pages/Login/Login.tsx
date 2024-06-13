import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { ButtonWrapper } from 'styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from 'components'
import { loginSchema } from 'helpers'
import { useAppDispatch, useLocalStorage } from 'hooks'
import { loginUser } from 'store'
import { loginInitialValues } from 'lib'
import { IUserToStore } from 'interfaces'
import toast from 'react-hot-toast'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()

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
              type="password"
            />
            <ButtonWrapper>
              <Button
                type="reset"
                disabled={isSubmitting}
                onClick={() => navigate('/')}
                $inverted>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </AuthorizationMenu>
  )
}
