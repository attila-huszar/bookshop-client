import { forwardRef } from 'react'
import { Formik, Form } from 'formik'
import { Button, FormikField } from '../../components'
import { StyledPasswordChange } from './PasswordChange.styles'
import { ButtonWrapper } from '../../styles/Form.styles'
import { passwordChangeInitialValues } from '../../lib'
import { accountPasswordSchema, passwordEncrypt } from '../../utils'
import { useAppDispatch } from '../../hooks'
import { updateUser } from '../../store'
import { verifyPassword } from '../../api/fetchData'
import toast from 'react-hot-toast'

export const PasswordChange = forwardRef(
  (
    { uuid, onClose }: { uuid: string; onClose: () => void },
    ref: React.ForwardedRef<HTMLElement>,
  ) => {
    const dispatch = useAppDispatch()

    const handlePasswordChange = async (values: {
      currentPassword: string
      newPassword: string
      newPasswordConfirmation: string
    }) => {
      if (values.newPassword === values.newPasswordConfirmation) {
        const isPasswordValid = await verifyPassword(
          uuid,
          values.currentPassword,
        )

        if (isPasswordValid) {
          dispatch(
            updateUser({
              uuid,
              fields: { password: passwordEncrypt(values.newPassword) },
            }),
          )

          toast.success('Password Changed Successfully')
          onClose()
        } else {
          toast.error('Current Password Invalid')
        }
      }
    }

    return (
      <StyledPasswordChange ref={ref}>
        <h2>Change Password</h2>
        <Formik
          initialValues={passwordChangeInitialValues}
          validationSchema={accountPasswordSchema}
          onSubmit={(values) => handlePasswordChange(values)}>
          {({ values, handleChange, isSubmitting }) => (
            <Form>
              <div>
                <p>Current Password</p>
                <FormikField
                  name="currentPassword"
                  value={values.currentPassword}
                  onChange={handleChange}
                  placeholder="Current Password"
                  type="password"
                />
              </div>
              <div>
                <p>New Password</p>
                <FormikField
                  name="newPassword"
                  value={values.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  type="password"
                />
              </div>
              <div>
                <p>Confirm New Password</p>
                <FormikField
                  name="newPasswordConfirmation"
                  value={values.newPasswordConfirmation}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  type="password"
                />
              </div>
              <ButtonWrapper>
                <Button onClick={onClose} $size="sm" $inverted>
                  Cancel
                </Button>
                <Button $size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </ButtonWrapper>
            </Form>
          )}
        </Formik>
      </StyledPasswordChange>
    )
  },
)
