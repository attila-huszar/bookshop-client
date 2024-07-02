import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Formik, Form } from 'formik'
import { StyledPasswordDialog } from './PasswordDialog.styles'
import { ButtonWrapper } from 'styles/Form.styles'
import { Button, FormikField, IconButton } from 'components'
import { passwordChangeInitialValues } from 'lib'
import { accountPasswordSchema, passwordEncrypt } from 'helpers'
import { useAppDispatch } from 'hooks'
import { updateUser } from 'store'
import { verifyPassword } from 'api/fetchData'
import BackIcon from 'assets/svg/chevron_left_circle.svg?react'
import toast from 'react-hot-toast'

function PasswordDialog(
  { uuid }: { uuid: string },
  ref: ForwardedRef<Partial<HTMLDialogElement>>,
) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [showPassword, setShowPassword] = useState(false)
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
          <Form noValidate>
            <p>Current Password</p>
            <FormikField
              name="currentPassword"
              placeholder="Current Password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
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
              <IconButton
                icon={<BackIcon />}
                $iconSize="lg"
                $color="var(--mid-grey)"
                type="reset"
                title="Back"
                onClick={handleClose}
              />
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
