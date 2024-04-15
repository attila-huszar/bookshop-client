import { Formik, Form, Field, ErrorMessage } from 'formik'
import { StyledRegistration, ButtonWrapper } from './Registration.styles'
import { Button } from '../../components'

export function Registration() {
  return (
    <StyledRegistration>
      <h2>User Registration</h2>
      <Formik
        initialValues={{ firstName: '', lastName: '', email: '', password: '' }}
        validate={(values) => {
          const errors = { email: '', password: '' }

          if (!values.email) {
            errors.email = 'Required'
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
          ) {
            errors.email = 'Invalid email address'
          }

          return errors
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            console.log(values)
            alert(JSON.stringify(values, null, 2))

            setSubmitting(false)
          }, 400)
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

            <p>Password</p>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />

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
