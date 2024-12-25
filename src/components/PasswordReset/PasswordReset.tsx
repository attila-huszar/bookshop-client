import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { HTTPError } from 'ky'
import { toast } from 'react-hot-toast'
import { StyledPasswordReset } from './PasswordReset.style'
import { FormikField, Button } from '@/components'
import { ButtonWrapper } from '@/styles/Form.style'
import { updateUser } from '@/store'
import { useAppDispatch } from '@/hooks'
import { postVerifyPasswordReset } from '@/api/users'
import { resetPasswordSchema } from '@/helpers'
import { PATH, passwordResetInitialValues } from '@/constants'

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

    if (token) {
      postVerifyPasswordReset(token)
        .then((resetResponse) => setEmail(resetResponse.email))
        .catch(async (error) => {
          const errorMessage =
            error instanceof HTTPError
              ? (await error.response.json<{ error: string }>()).error
              : 'Password reset failed, please try again later'

          toast.error(errorMessage, { id: 'reset-error' })

          void navigate('/', { replace: true })
        })
    }
  }, [token, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    if (email && values.newPassword === values.newPasswordConfirmation) {
      try {
        await dispatch(updateUser({ password: values.newPassword }))

        void navigate(`/${PATH.CLIENT.login}`, { replace: true })
        toast.success('Password Changed Successfully', {
          id: 'reset-success',
        })
      } catch {
        toast.error('Error changing password, please try again later', {
          id: 'password-change-error',
        })
      }
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
