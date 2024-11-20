import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { StyledPasswordReset } from './PasswordReset.style'
import { FormikField, Button } from '@/components'
import { ButtonWrapper } from '@/styles/Form.style'
import { PATH, passwordResetInitialValues } from '@/constants'
import { resetPasswordSchema } from '@/helpers'
import { useAppDispatch } from '@/hooks'
import { updateUser } from '@/store'

export function PasswordReset() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const resetCode = queryParams.get('code')
  const [email] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (resetCode) {
      // passwordReset(resetCode)
      //   .then((resetResponse) => setUUID(resetResponse))
      //   .catch((error: Error) => {
      //     toast.error(error.message, {
      //       id: 'reset-error',
      //     })
      //     navigate('/', { replace: true })
      //   })
    }
  }, [resetCode, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    if (email && values.newPassword === values.newPasswordConfirmation) {
      try {
        await dispatch(updateUser({ password: values.newPassword }))

        navigate(`/${PATH.CLIENT.login}`, { replace: true })
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
