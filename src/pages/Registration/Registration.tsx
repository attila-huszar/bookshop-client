import { Formik, Form, Field, ErrorMessage } from 'formik'
import { StyledRegistration, ButtonWrapper } from './Registration.styles'
import { Button } from '../../components'
import { RegistrationSchema } from '../../utils/validationSchema'
import { registerUser } from '../../api/fetchData'
import { passwordEncrypt } from '../../utils/passwordHash'
import { v4 as uuidv4 } from 'uuid'

export function Registration() {
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
        onSubmit={(values) => {
          const user = {
            uuid: uuidv4() as string,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: passwordEncrypt(values.password),
          }

          registerUser(user)
        }}>
        {({ isSubmitting }) => (
          <Form>
            <p>First Name</p>
            <Field name="firstName" placeholder="First Name" />

            <p>Last Name</p>
            <Field name="lastName" placeholder="Last Name" />

            <p>Email</p>
            <Field type="email" name="email" placeholder="Email" />
            <ErrorMessage name="email" component="div" />

            <p>Phone</p>
            <Field type="tel" name="phone" placeholder="Phone" />
            <ErrorMessage name="phone" component="div" />

            <p>Password</p>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />

            <p>Confirm Password</p>
            <Field type="password" name="passwordConfirmation" />
            <ErrorMessage name="passwordConfirmation" component="div" />

            <ButtonWrapper>
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledRegistration>
  )
}
