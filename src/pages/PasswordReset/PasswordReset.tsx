import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { StyledPasswordReset } from './PasswordReset.style'
import { FormikField, Button, Loading } from '@/components'
import { ButtonWrapper } from '@/styles'
import { postPasswordResetSubmit, postVerifyPasswordReset } from '@/api'
import { resetPasswordSchema } from '@/validation'
import { passwordResetInitialValues } from '@/constants'
import { handleError } from '@/errors'

export function PasswordReset() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const tokenParam = queryParams.get('token')
  const [isVerifying, setIsVerifying] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const hasVerified = useRef(false)

  useEffect(() => {
    if (!tokenParam) {
      setIsVerifying(false)
      toast.error('Invalid or missing password reset token')
      void navigate('/', { replace: true })
      return
    }

    if (hasVerified.current) return

    hasVerified.current = true

    const verifyToken = async () => {
      try {
        const response = await postVerifyPasswordReset(tokenParam)

        setToken(response.token)

        toast.success('Please enter your new password')
      } catch (error) {
        const formattedError = await handleError({
          error,
          message: 'Password reset failed, please try again later',
        })

        toast.error(formattedError.message)

        void navigate('/', { replace: true })
      } finally {
        setIsVerifying(false)
      }
    }

    void verifyToken()
  }, [tokenParam, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    if (!token) {
      toast.error('Invalid or expired token')
      return
    }

    if (values.newPassword !== values.newPasswordConfirmation) {
      toast.error('Passwords do not match')
      return
    }

    try {
      const response = await postPasswordResetSubmit(token, values.newPassword)
      toast.success(response.message)

      void navigate('/login', { replace: true })
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: 'Error changing password, please try again later',
      })
      toast.error(formattedError.message)
    }
  }

  if (isVerifying) {
    return <Loading message="Verifying" fullScreen />
  }

  if (!token) {
    return null
  }

  return (
    <StyledPasswordReset>
      <h2>Password Reset</h2>
      <p>Please enter your new password below.</p>
      <Formik
        initialValues={passwordResetInitialValues}
        validationSchema={resetPasswordSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>New Password</p>
            <FormikField
              name="newPassword"
              placeholder="New Password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <p>Confirm New Password</p>
            <FormikField
              name="newPasswordConfirmation"
              placeholder="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <ButtonWrapper>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledPasswordReset>
  )
}
