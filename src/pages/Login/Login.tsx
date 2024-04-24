import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { Label, ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { loginSchema } from '../../utils/validationSchema'
import { useAppDispatch, useAppSelector, useLocalStorage } from '../../hooks'
import { loginUser } from '../../store/userSlice'
import toast from 'react-hot-toast'
import { loginInitialValues } from '../../lib/defaultValues'
import { userSelector, loginErrorSelector } from '../../store'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()
  const user = useAppSelector(userSelector)
  const loginError = useAppSelector(loginErrorSelector)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
      toast.success(`Welcome back, ${user.firstName}!`)
      setToLocalStorage('uuid', user.uuid)
    } else if (loginError) {
      toast.error(loginError as string)
    }
  }, [user, loginError])

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
            <Label>Email</Label>
            <FormikField
              name="email"
              placeholder="Email"
              type="email"
              inputMode="email"
              focus
            />

            <Label>Password</Label>
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
