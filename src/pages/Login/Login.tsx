import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { loginSchema } from '../../utils/validationSchema'
import { useAppDispatch, useAppSelector, useLocalStorage } from '../../hooks'
import { loginInitialValues } from '../../lib/defaultValues'
import { userSelector, loginUser } from '../../store'
import toast from 'react-hot-toast'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()
  const { userData, loginError } = useAppSelector(userSelector)

  useEffect(() => {
    if (userData) {
      navigate('/', { replace: true })
      toast.success(`Welcome back, ${userData.firstName}!`)
      setToLocalStorage('uuid', userData.uuid)
    } else if (loginError) {
      toast.error(loginError as string)
    }
  }, [loginError, navigate, setToLocalStorage, userData])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        validateOnBlur={false}
        onSubmit={(values, actions) => {
          dispatch(
            loginUser({ email: values.email, password: values.password }),
          )
          actions.setSubmitting(false)
        }}>
        {({ isSubmitting }) => (
          <Form>
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
