import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { StyledForm, Label, ButtonWrapper } from '../../styles/Form.styles'
import { FormikField, Button } from '../../components'
import { LoginSchema } from '../../utils/validationSchema'
import { useAppDispatch } from '../../hooks'
import { loginUser } from '../../store/userSlice'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <StyledForm>
      <h2>Please Log In</h2>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={(values, actions): void => {
          dispatch(
            loginUser({ email: values.email, password: values.password }),
          )
            .then((res) => {
              console.log(res)
              if (res.meta.requestStatus === 'fulfilled') {
                navigate('/', { replace: true })
              }
            })
            .finally(() => actions.setSubmitting(false))
        }}>
        {({ isValid, isSubmitting }) => (
          <Form>
            <Label>Email</Label>
            <FormikField
              name="email"
              placeholder="Email"
              type="email"
              inputMode="email"
            />

            <Label>Password</Label>
            <FormikField
              name="password"
              placeholder="Password"
              type="password"
            />

            <ButtonWrapper>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
