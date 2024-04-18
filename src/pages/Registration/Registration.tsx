import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { StyledRegistration, Label, ButtonWrapper } from './Registration.styles'
import { Button } from '../../components'
import { RegistrationSchema } from '../../utils/validationSchema'
import { passwordEncrypt } from '../../utils/passwordHash'
import { v4 as uuidv4 } from 'uuid'
import { FieldCustomStyle } from './FieldCustomStyle'
import { useAppDispatch } from '../../hooks'
import { registerUser, getUser } from '../../store/userSlice'

export function Registration() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <StyledRegistration>
      <h2>User Registration</h2>
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
        onSubmit={(values, actions) => {
          const user = {
            uuid: uuidv4() as string,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: passwordEncrypt(values.password),
          }

          dispatch(registerUser(user)).then(() =>
            dispatch(
              getUser({ email: values.email, password: values.password }),
            ).then((res) => {
              if (res.meta.requestStatus === 'fulfilled') {
                navigate('/', { replace: true })
              }
            }),
          )

          const timeOut = setTimeout(() => {
            actions.setSubmitting(false)

            clearTimeout(timeOut)
          }, 500)
        }}>
        {({ isValid, isSubmitting }) => (
          <Form>
            <Label>First Name</Label>
            <FieldCustomStyle name="firstName" placeholder="First Name" />

            <Label>Last Name</Label>
            <FieldCustomStyle name="lastName" placeholder="Last Name" />

            <Label>Email</Label>
            <FieldCustomStyle
              name="email"
              placeholder="Email"
              type="email"
              inputMode="email"
            />

            <Label>Password</Label>
            <FieldCustomStyle
              name="password"
              placeholder="Password"
              type="password"
            />

            <Label>Password Confirm</Label>
            <FieldCustomStyle
              name="passwordConfirmation"
              placeholder="Confirm Password"
              type="password"
            />

            <Label>Phone</Label>
            <FieldCustomStyle
              name="phone"
              placeholder="Phone"
              type="tel"
              inputMode="numeric"
            />

            <ButtonWrapper>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledRegistration>
  )
}
