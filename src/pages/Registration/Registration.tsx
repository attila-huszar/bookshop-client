import { Formik, Form, Field } from 'formik'
import { StyledRegistration, Label, ButtonWrapper } from './Registration.styles'
import { Button } from '../../components'
import { RegistrationSchema } from '../../utils/validationSchema'
import { passwordEncrypt } from '../../utils/passwordHash'
import { v4 as uuidv4 } from 'uuid'
import { FormikField } from './FormikField'
import { IFormikField } from './Registration.types'
import { useAppDispatch } from '../../hooks'
import { getUser, registerUser } from '../../store/userSlice'

export function Registration() {
  const dispatch = useAppDispatch()

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
        onSubmit={async (values, actions) => {
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
            ),
          )

          const timeOut = setTimeout(() => {
            actions.setSubmitting(false)

            clearTimeout(timeOut)
          }, 500)
        }}>
        {({ isValid, isSubmitting }) => (
          <Form>
            <Label>First Name</Label>
            <Field name="firstName">
              {({ field, meta }: IFormikField) => (
                <FormikField {...{ field, meta }} placeholder="First Name" />
              )}
            </Field>

            <Label>Last Name</Label>
            <Field name="lastName">
              {({ field, meta }: IFormikField) => (
                <FormikField {...{ field, meta }} placeholder="Last Name" />
              )}
            </Field>

            <Label>Email</Label>
            <Field name="email">
              {({ field, meta }: IFormikField) => (
                <FormikField
                  {...{ field, meta }}
                  type="email"
                  placeholder="Email"
                />
              )}
            </Field>

            <Label>Phone</Label>
            <Field name="phone">
              {({ field, meta }: IFormikField) => (
                <FormikField
                  {...{ field, meta }}
                  type="tel"
                  placeholder="Phone"
                  inputMode="numeric"
                />
              )}
            </Field>

            <Label>Password</Label>
            <Field name="password">
              {({ field, meta }: IFormikField) => (
                <FormikField
                  {...{ field, meta }}
                  type="password"
                  placeholder="Password"
                />
              )}
            </Field>

            <Label>Password Confirm</Label>
            <Field name="passwordConfirmation">
              {({ field, meta }: IFormikField) => (
                <FormikField
                  {...{ field, meta }}
                  type="password"
                  placeholder="Confirm Password"
                />
              )}
            </Field>

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
