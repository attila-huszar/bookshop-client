import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { ButtonWrapper } from '@/styles'
import {
  AuthorizationMenu,
  FormikField,
  Button,
  IconButton,
} from '@/components'
import { register } from '@/store'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { registrationSchema } from '@/validation'
import { registrationInitialValues } from '@/constants'
import { RegisterRequest } from '@/types'
import { BackIcon, SpinnerIcon } from '@/assets/svg'

export function Registration() {
  const registerError = useAppSelector((state) => state.user.registerError)
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values: RegisterRequest) => {
    const result = await dispatch(register(values))

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(
        `${values.email} registered successfully, please verify your email address`,
      )
      await navigate('/', { replace: true })
    } else {
      toast.error(registerError ?? 'Registration failed. Please try again.')
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
              autoComplete="username"
            />
            <p>Password</p>
            <FormikField
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
            />
            <p>Password Confirm</p>
            <FormikField
              name="passwordConfirmation"
              placeholder="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
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
                onClick={() => void navigate('/')}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <SpinnerIcon height={28} /> : 'Register'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </AuthorizationMenu>
  )
}
