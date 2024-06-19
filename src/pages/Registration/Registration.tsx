import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { ButtonWrapper } from 'styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from 'components'
import { postUserRegister } from 'api/fetchData'
import { registrationSchema, passwordEncrypt } from 'helpers'
import { registrationInitialValues } from 'lib'
import { IUser } from 'interfaces'
import toast from 'react-hot-toast'

export function Registration() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values: {
    firstName: string
    lastName: string
    email: string
    password: string
    avatar: null | File
  }) => {
    const user: IUser = {
      uuid: crypto.randomUUID(),
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
      role: 'user',
      verified: false,
      verificationCode: crypto.randomUUID(),
      verificationCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      const registerResponse = await postUserRegister(user)

      navigate('/', { replace: true })
      toast.success(registerResponse)
    } catch (error) {
      toast.error(error as string)
    }
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={registrationInitialValues}
        validationSchema={registrationSchema}
        validateOnBlur={false}
        onSubmit={(values) => handleSubmit(values)}>
        {({ isSubmitting }) => (
          <Form noValidate>
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
              <Button
                type="reset"
                disabled={isSubmitting}
                onClick={() => navigate('/')}
                $inverted>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </AuthorizationMenu>
  )
}
