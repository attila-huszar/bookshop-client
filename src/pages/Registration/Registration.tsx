import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { HTTPError } from 'ky'
import { postUserRegister } from '@/api/users'
import { ButtonWrapper } from '@/styles/Form.style'
import {
  AuthorizationMenu,
  FormikField,
  Button,
  IconButton,
} from '@/components'
import { registrationSchema } from '@/helpers'
import { registrationInitialValues } from '@/constants'
import type { RegisterRequest } from '@/types'
import BackIcon from '@/assets/svg/chevron_left_circle.svg?react'

export function Registration() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      const registerResponse = await postUserRegister(values)

      toast.success(
        `${registerResponse.email} registered successfully, please verify your email address`,
        {
          id: 'register-success',
        },
      )

      await navigate('/', { replace: true })
    } catch (error) {
      const errorMessage =
        error instanceof HTTPError
          ? (await error.response.json<{ error: string }>()).error
          : 'Registration failed, please try again later'

      toast.error(errorMessage, { id: 'register-error' })
    }
  }

  const navigateToHome = async () => {
    await navigate('/')
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={registrationInitialValues}
        validationSchema={registrationSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
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
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <p>Password Confirm</p>
            <FormikField
              name="passwordConfirmation"
              placeholder="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <p>Upload Avatar</p>
            <FormikField name="avatar" type="file" />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $iconSize="lg"
                $color="var(--mid-grey)"
                type="reset"
                title="Back"
                disabled={isSubmitting}
                onClick={() => void navigateToHome()}
              />
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
