import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { StyledPasswordReset } from './PasswordReset.style'
import { FormikField, Button } from '@/components'
import { ButtonWrapper } from '@/styles/Form.style'
import { postPasswordResetSubmit, postVerifyPasswordReset } from '@/api'
import { resetPasswordSchema } from '@/helpers'
import { passwordResetInitialValues } from '@/constants'
import { handleErrors } from '@/errors'

export function PasswordReset() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const tokenParam = queryParams.get('token')
  const [token, setToken] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const isEffectRun = useRef(false)

  useEffect(() => {
    if (isEffectRun.current || !tokenParam) return
    isEffectRun.current = true

    const verifyToken = async () => {
      try {
        const response = await postVerifyPasswordReset(tokenParam)

        setToken(response.token)

        toast.success(`Please enter your new password`, {
          id: 'passwordReset',
        })
      } catch (error) {
        const formattedError = await handleErrors({
          error,
          message: 'Password reset failed, please try again later',
        })

        toast.error(formattedError.message, { id: 'passwordReset' })

        await navigate('/', { replace: true })
      }
    }

    void verifyToken()
  }, [tokenParam, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    try {
      if (token && values.newPassword === values.newPasswordConfirmation) {
        const response = await postPasswordResetSubmit(
          token,
          values.newPassword,
        )

        toast.success(response.message, {
          id: 'passwordChange',
        })
      }
    } catch (error) {
      const formattedError = await handleErrors({
        error,
        message: 'Error changing password, please try again later',
      })

      toast.error(formattedError.message, { id: 'passwordChange' })
    } finally {
      setToken(null)
      await navigate('/', { replace: true })
    }
  }

  return (
    token && (
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
  )
}
