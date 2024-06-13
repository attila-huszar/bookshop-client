import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { Formik, Form } from 'formik'
import { StyledPasswordDialog } from './PasswordDialog.styles'
import { ButtonWrapper } from 'styles/Form.styles'
import { Button, FormikField } from 'components'
import { passwordChangeInitialValues } from 'lib'
import { accountPasswordSchema, passwordEncrypt } from 'helpers'
import { useAppDispatch } from 'hooks'
import { updateUser } from 'store'
import { verifyPassword } from 'api/fetchData'
import toast from 'react-hot-toast'

function PasswordDialog(
  { uuid }: { uuid: string },
  ref: ForwardedRef<Partial<HTMLDialogElement>>,
) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const dispatch = useAppDispatch()

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }))

  const handleClose = () => {
    dialogRef.current?.close()
  }

  const handleSubmit = async (
    values: {
      currentPassword: string
      newPassword: string
      newPasswordConfirmation: string
    },
    actions: { resetForm: () => void },
  ) => {
    if (values.newPassword === values.newPasswordConfirmation) {
      const isPasswordValid = await verifyPassword(uuid, values.currentPassword)

      if (isPasswordValid) {
        dispatch(
          updateUser({
            uuid,
            fields: { password: passwordEncrypt(values.newPassword) },
          }),
        )

        handleClose()
        actions.resetForm()
        toast.success('Password Changed Successfully')
      } else {
        toast.error('Current Password Invalid', {
          id: 'password-error',
        })
      }
    }
  }

  return (
    <StyledPasswordDialog ref={dialogRef}>
      <h2>Change Password</h2>
      <Formik
        initialValues={passwordChangeInitialValues}
        validationSchema={accountPasswordSchema}
        onSubmit={(values, actions) => handleSubmit(values, actions)}>
        {({ isSubmitting }) => (
          <Form>
            <p>Current Password</p>
            <FormikField
              name="currentPassword"
              placeholder="Current Password"
              type="password"
            />
            <p>New Password</p>
            <FormikField
              name="newPassword"
              placeholder="New Password"
              type="password"
            />
            <p>Confirm New Password</p>
            <FormikField
              name="newPasswordConfirmation"
              placeholder="Confirm New Password"
              type="password"
            />
            <ButtonWrapper>
              <Button type="reset" onClick={handleClose} $size="sm" $inverted>
                Cancel
              </Button>
              <Button type="submit" $size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledPasswordDialog>
  )
}

export const PasswordDialogRef = forwardRef(PasswordDialog)
