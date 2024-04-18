import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { Label, ButtonWrapper } from '../../styles/Form.styles'
import { FormikField, Button } from '../../components'
import { LoginSchema } from '../../utils/validationSchema'
import { useAppDispatch, useLocalStorage } from '../../hooks'
import { loginUser } from '../../store/userSlice'
import toast from 'react-hot-toast'

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setLocalStore } = useLocalStorage()

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={LoginSchema}
      onSubmit={(values, actions): void => {
        dispatch(loginUser({ email: values.email, password: values.password }))
          .then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
              navigate('/', { replace: true })
              toast.success(`Welcome back, ${res.payload.firstName}!`)
              setLocalStore('uuid', res.payload.uuid)
            } else {
              toast.error(res.payload)
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
            autoFocus={true}
          />

          <Label>Password</Label>
          <FormikField name="password" placeholder="Password" type="password" />

          <ButtonWrapper>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </ButtonWrapper>
        </Form>
      )}
    </Formik>
  )
}
