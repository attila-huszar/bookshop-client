import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { Label, ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { RegistrationSchema } from '../../utils/validationSchema'
import { passwordEncrypt } from '../../utils/passwordHash'
import { v4 as uuidv4 } from 'uuid'
import { useAppDispatch, useLocalStorage } from '../../hooks'
import { registerUser, loginUser } from '../../store/userSlice'
import toast from 'react-hot-toast'

export function Registration() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setLocalStore } = useLocalStorage()

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          passwordConfirmation: '',
        }}
        validationSchema={RegistrationSchema}
        validateOnBlur={false}
        onSubmit={(values, actions) => {
          const user = {
            uuid: uuidv4() as string,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: passwordEncrypt(values.password),
          }

          dispatch(registerUser(user))
            .then(() =>
              dispatch(
                loginUser({ email: values.email, password: values.password }),
              ).then((response) => {
                if (response.meta.requestStatus === 'fulfilled') {
                  navigate('/', { replace: true })
                  toast.success(
                    `${response.payload.email} registered successfully! You are now logged in!`,
                  )
                  setLocalStore('uuid', response.payload.uuid)
                } else {
                  toast.error('Registration Failed')
                }
              }),
            )
            .finally(() => actions.setSubmitting(false))
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Label>First Name</Label>
            <FormikField name="firstName" placeholder="First Name" focus />

            <Label>Last Name</Label>
            <FormikField name="lastName" placeholder="Last Name" />

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

            <Label>Password Confirm</Label>
            <FormikField
              name="passwordConfirmation"
              placeholder="Confirm Password"
              type="password"
            />

            <Label>Phone</Label>
            <FormikField
              name="phone"
              placeholder="Phone"
              type="tel"
              inputMode="numeric"
            />

            <ButtonWrapper>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </AuthorizationMenu>
  )
}
