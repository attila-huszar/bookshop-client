import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Formik, Form } from 'formik'
import { toast } from 'react-hot-toast'
import { StyledPasswordDialog } from './PasswordDialog.style'
import { ButtonWrapper } from '@/styles/Form.style'
import { postUserLogin } from '@/api'
import { useAppDispatch } from '@/hooks'
import { updateUser } from '@/store'
import { Button, FormikField, IconButton } from '@/components'
import { passwordChangeInitialValues } from '@/constants'
import { accountPasswordSchema } from '@/helpers'
import BackIcon from '@/assets/svg/chevron_left_circle.svg?react'

function PasswordDialog(
  { email }: { email: string },
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
    if (values.currentPassword !== values.newPassword) {
      try {
        await postUserLogin({
          email,
          password: values.currentPassword,
        })
      } catch {
        toast.error('Current password invalid', {
          id: 'password-change-fail',
        })
        return
      }

      try {
        await dispatch(updateUser({ password: values.newPassword }))

        handleClose()
        actions.resetForm()
        toast.success('Password changed successfully')
      } catch {
        toast.error('Failed to change password, please try again later', {
          id: 'password-change-fail',
        })
      }
    } else {
      toast.error('Password must be different from current password', {
        id: 'password-change-fail',
      })
    }
  }

  return (
    <StyledPasswordDialog
      ref={dialogRef}
      role="dialog"
      aria-modal
      aria-label="Change Password">
      <h2>Change Password</h2>
      <Formik
        initialValues={passwordChangeInitialValues}
        validationSchema={accountPasswordSchema}
        onSubmit={handleSubmit}>
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
