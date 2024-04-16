import { Formik, Form, Field, FieldInputProps, FieldMetaProps } from 'formik'
import {
  StyledRegistration,
  Label,
  InputWrapper,
  Input,
  ButtonWrapper,
  ErrorMessage,
} from './Registration.styles'
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
        onSubmit={(values, actions) => {
          const user = {
            uuid: uuidv4() as string,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: passwordEncrypt(values.password),
          }

          registerUser(user)

          const timeOut = setTimeout(() => {
            actions.setSubmitting(false)

            clearTimeout(timeOut)
          }, 1000)
        }}>
        {({ isValid, isSubmitting }) => (
          <Form>
            <Label>First Name</Label>
            <Field name="firstName">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>
                meta: FieldMetaProps<string>
              }) => (
                <InputWrapper>
                  <Input
                    $valid={meta.touched && !meta.error}
                    $error={meta.touched && meta.error}
                    placeholder="First Name"
                    {...field}
                  />
                  {meta.touched && meta.error && (
                    <ErrorMessage>{meta.error}</ErrorMessage>
                  )}
                </InputWrapper>
              )}
            </Field>

            <Label>Last Name</Label>
            <Field name="lastName">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>
                meta: FieldMetaProps<string>
              }) => (
                <InputWrapper>
                  <Input
                    $valid={meta.touched && !meta.error}
                    $error={meta.touched && meta.error}
                    placeholder="Last Name"
                    {...field}
                  />
                  {meta.touched && meta.error && (
                    <ErrorMessage>{meta.error}</ErrorMessage>
                  )}
                </InputWrapper>
              )}
            </Field>

            <Label>Email</Label>
            <Field name="email">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>
                meta: FieldMetaProps<string>
              }) => (
                <InputWrapper>
                  <Input
                    $valid={meta.touched && !meta.error}
                    $error={meta.touched && meta.error}
                    type="email"
                    placeholder="Email"
                    {...field}
                  />
                  {meta.touched && meta.error && (
                    <ErrorMessage>{meta.error}</ErrorMessage>
                  )}
                </InputWrapper>
              )}
            </Field>

            <Label>Phone</Label>
            <Field name="phone">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>
                meta: FieldMetaProps<string>
              }) => (
                <InputWrapper>
                  <Input
                    $valid={meta.touched && !meta.error}
                    $error={meta.touched && meta.error}
                    type="tel"
                    inputMode="numeric"
                    placeholder="Phone"
                    {...field}
                  />
                  {meta.touched && meta.error && (
                    <ErrorMessage>{meta.error}</ErrorMessage>
                  )}
                </InputWrapper>
              )}
            </Field>

            <Label>Password</Label>
            <Field name="password">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>
                meta: FieldMetaProps<string>
              }) => (
                <InputWrapper>
                  <Input
                    $valid={meta.touched && !meta.error}
                    $error={meta.touched && meta.error}
                    type="password"
                    placeholder="Password"
                    {...field}
                  />
                  {meta.touched && meta.error && (
                    <ErrorMessage>{meta.error}</ErrorMessage>
                  )}
                </InputWrapper>
              )}
            </Field>

            <Label>Password Confirm</Label>
            <Field name="passwordConfirmation">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>
                meta: FieldMetaProps<string>
              }) => (
                <InputWrapper>
                  <Input
                    $valid={meta.touched && !meta.error}
                    $error={meta.touched && meta.error}
                    type="password"
                    placeholder="Password Confirm"
                    {...field}
                  />
                  {meta.touched && meta.error && (
                    <ErrorMessage>{meta.error}</ErrorMessage>
                  )}
                </InputWrapper>
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
