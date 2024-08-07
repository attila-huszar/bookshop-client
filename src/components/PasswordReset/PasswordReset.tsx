import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { FormikField } from 'components/FormikField/FormikField'
import { StyledPasswordReset } from './PasswordReset.styles'
import { ButtonWrapper } from 'styles/Form.styles'
import { Button } from 'components/Button/Button'
import { passwordReset } from 'api/fetchData'
import { PATH, passwordResetInitialValues } from 'lib'
import { passwordEncrypt, resetPasswordSchema } from 'helpers'
import { useAppDispatch } from 'hooks'
import { updateUser } from 'store'
import toast from 'react-hot-toast'

export function PasswordReset() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const code = queryParams.get('code')
  const [resetting, setResetting] = useState<{
    state: boolean
    uuid: string | null
  }>({ state: false, uuid: null })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (code) {
      passwordReset(code)
        .then((resetResponse) => {
          if (resetResponse.success) {
            setResetting({ state: true, uuid: resetResponse.uuid })
          }
        })
        .catch((error) => {
          toast.error(error.message, {
            id: 'reset-error',
          })
          navigate('/')
        })
    }
  }, [code, navigate])

  const handleSubmit = async (values: {
    newPassword: string
    newPasswordConfirmation: string
  }) => {
    if (
      resetting.uuid &&
      values.newPassword === values.newPasswordConfirmation
    ) {
      dispatch(
        updateUser({
          uuid: resetting.uuid,
          fields: { password: passwordEncrypt(values.newPassword) },
        }),
      )

      navigate(`/${PATH.login}`)
      toast.success('Password Changed Successfully', {
        id: 'reset-success',
      })
    } else {
      toast.error('Error changing password, please try again later', {
        id: 'password-change-error',
      })
    }
  }

  return (
    resetting.state && (
      <StyledPasswordReset>
        <h2>Password Reset</h2>
        <p>Please enter your new password below.</p>
        <Formik
          initialValues={passwordResetInitialValues}
          validationSchema={resetPasswordSchema}
          validateOnBlur={false}
          onSubmit={(values) => handleSubmit(values)}>
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
