import { useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { IUser } from '@/interfaces'
import BackIcon from '@/assets/svg/chevron_left_circle.svg?react'

export function Registration() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values: {
    firstName: string
    lastName: string
    email: string
    password: string
    avatar: File | undefined
  }) => {
    const user: IUser & { password: string } = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      avatar: values.avatar,
    }

    try {
      const registerResponse = await postUserRegister(user)

      navigate('/', { replace: true })

      toast.success(
        `${registerResponse.email} registered successfully, please verify your email address`,
        {
          id: 'register-success',
        },
      )
    } catch (error) {
      if (error instanceof HTTPError) {
        const errorResponse = await error.response.json<{ error: string }>()
        toast.error(errorResponse.error, {
          id: 'register-error',
        })
      } else {
        toast.error('Registration failed, please try again later', {
          id: 'register-error',
        })
      }
    }
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
                onClick={() => navigate('/')}
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
