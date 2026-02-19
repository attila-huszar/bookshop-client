import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { Form, Formik } from 'formik'
import { getUserCountry } from '@/api'
import { register } from '@/store'
import { AuthorizationMenu } from '@/components/AuthorizationMenu/AuthorizationMenu'
import { Button } from '@/components/Button/Button'
import { IconButton } from '@/components/Button/IconButton'
import { CountrySelect } from '@/components/CountrySelect/CountrySelect'
import { FormikField } from '@/components/FormikField/FormikField'
import { useAppDispatch } from '@/hooks'
import { registrationSchema } from '@/validation'
import { defaultCountry, registrationInitialValues } from '@/constants'
import { RegisterRequest } from '@/types'
import { BackIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles'

export function Registration() {
  const dispatch = useAppDispatch()
  const [country, setCountry] = useState(defaultCountry)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchCountry = async () => {
      const data = await getUserCountry()
      setCountry(data.country || defaultCountry)
    }
    void fetchCountry()
  }, [])

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      const { email } = await dispatch(register(values)).unwrap()
      toast.success(
        `${email} registered successfully, please verify your email address`,
      )
      void navigate('/', { replace: true })
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error.message as string)
          : 'Registration failed, please try again later'
      toast.error(errorMessage)
    }
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={{ ...registrationInitialValues, country }}
        enableReinitialize
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
            <p>Country</p>
            <CountrySelect initial={country} />
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
