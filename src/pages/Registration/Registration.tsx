import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { Label, ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { registrationSchema, passwordEncrypt } from '../../utils'
import { registrationInitialValues } from '../../lib/defaultValues'
import { v4 as uuidv4 } from 'uuid'
import { useAppDispatch, useAppSelector, useLocalStorage } from '../../hooks'
import { userSelector, registerUser, registerErrorSelector } from '../../store'
import toast from 'react-hot-toast'

export function Registration() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()
  const user = useAppSelector(userSelector)
  const registerError = useAppSelector(registerErrorSelector)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
      toast.success(
        `${user.email} registered successfully! You are now logged in!`,
      )
      setToLocalStorage('uuid', user.uuid)
    } else if (registerError) {
      toast.error(registerError as string)
    }
  }, [user, registerError])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={registrationInitialValues}
        validationSchema={registrationSchema}
        validateOnBlur={false}
        onSubmit={(values, actions) => {
          const user = {
            uuid: uuidv4() as string,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: passwordEncrypt(values.password),
            avatar: values.avatar,
          }

          dispatch(registerUser(user))
          actions.setSubmitting(false)
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

            <Label>Upload Avatar</Label>
            <FormikField name="avatar" type="file" />

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
