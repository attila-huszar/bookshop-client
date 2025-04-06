import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { StyledPasswordReset } from './PasswordReset.style'
import { FormikField, Button } from '@/components'
import { ButtonWrapper } from '@/styles/Form.style'
import { updateUser } from '@/store'
import { useAppDispatch } from '@/hooks'
import { postVerifyPasswordReset } from '@/api'
import { resetPasswordSchema } from '@/helpers'
import { passwordResetInitialValues } from '@/constants'
import { ROUTE } from '@/routes'
import { handleErrors } from '@/errors'

export function PasswordReset() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const token = queryParams.get('token')
  const [email, setEmail] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const isEffectRun = useRef(false)

  useEffect(() => {
    if (isEffectRun.current || !token) return
    isEffectRun.current = true

    const verifyToken = async () => {
      try {
        const response = await postVerifyPasswordReset(token)

        setEmail(response.email)

        toast.success(
          `Password reset token verified for ${response.email}. Please enter your new password.`,
          { id: 'passwordReset' },
        )
      } catch (error) {
        const formattedError = await handleErrors({
          error,
          message: 'Password reset failed, please try again later.',
        })

        toast.error(formattedError.message, { id: 'passwordReset' })

        await navigate('/', { replace: true })
      }
    }

    void verifyToken()
  }, [token, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    if (email && values.newPassword === values.newPasswordConfirmation) {
      const response = await dispatch(
        updateUser({ password: values.newPassword }),
      )

      if (response.meta.requestStatus === 'fulfilled') {
        toast.success('Password successfully changed.', {
          id: 'passwordChange',
        })
      } else {
        toast.error('Error changing password, please try again later', {
          id: 'passwordChange',
        })
      }

      await navigate(`/${ROUTE.LOGIN}`, { replace: true })
    }
  }

  return (
    email && (
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
