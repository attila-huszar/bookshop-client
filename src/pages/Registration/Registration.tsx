import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { registrationSchema, passwordEncrypt } from '../../utils'
import { registrationInitialValues } from '../../lib/defaultValues'
import { v4 as uuidv4 } from 'uuid'
import { useAppDispatch, useAppSelector, useLocalStorage } from '../../hooks'
import { userSelector, registerUser } from '../../store'
import toast from 'react-hot-toast'

export function Registration() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()
  const { userData, registerError } = useAppSelector(userSelector)

  useEffect(() => {
    if (userData) {
      navigate('/', { replace: true })
      toast.success(
        `${userData.email} registered successfully! You are now logged in!`,
      )
      setToLocalStorage('uuid', userData.uuid)
    } else if (registerError) {
      toast.error(registerError as string)
    }
  }, [navigate, registerError, setToLocalStorage, userData])

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
            password: passwordEncrypt(values.password),
            address: {
              street: '',
              number: '',
              city: '',
              state: '',
              postCode: '',
              country: '',
            },
            phone: '',
            avatar: values.avatar,
          }

          dispatch(registerUser(user))
          actions.setSubmitting(false)
        }}>
        {({ isSubmitting }) => (
          <Form>
            <p>First Name</p>
            <FormikField name="firstName" placeholder="First Name" focus />
            <p>Last Name</p>
            <FormikField name="lastName" placeholder="Last Name" />
            <p>Email</p>
            <FormikField
              name="email"
              placeholder="Email"
              type="email"
              inputMode="email"
            />
            <p>Password</p>
            <FormikField
              name="password"
              placeholder="Password"
              type="password"
            />
            <p>Password Confirm</p>
            <FormikField
              name="passwordConfirmation"
              placeholder="Confirm Password"
              type="password"
            />
            <p>Upload Avatar</p>
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
