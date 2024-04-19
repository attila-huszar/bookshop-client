import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { Label, ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { LoginSchema } from '../../utils/validationSchema'
import { useAppDispatch, useLocalStorage } from '../../hooks'
import { loginUser } from '../../store/userSlice'
import toast from 'react-hot-toast'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        validateOnBlur={false}
        onSubmit={(values, actions): void => {
          dispatch(
            loginUser({ email: values.email, password: values.password }),
          )
            .then((response) => {
              if (response.meta.requestStatus === 'fulfilled') {
                navigate('/', { replace: true })
                toast.success(`Welcome back, ${response.payload.firstName}!`)
                setToLocalStorage('uuid', response.payload.uuid)
              } else {
                toast.error(response.payload)
              }
            })
            .finally(() => actions.setSubmitting(false))
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
