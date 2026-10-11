import { useImperativeHandle, useRef, useState } from 'react'
import { Form, Formik } from 'formik'
import { useUpdateUserProfileMutation } from '@/store/api/bookshopApi'
import { Button, FormikField, IconButton, toast } from '@/components'
import { useClickOutside } from '@/hooks'
import { getErrorMessage } from '@/helpers'
import { accountPasswordSchema } from '@/validation'
import { passwordChangeInitialValues } from '@/constants'
import { BackIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles'
import { StyledPasswordDialog } from './PasswordDialog.style'

type PasswordDialogHandle = {
  showModal: () => void
  close: () => void
}

type Props = { email: string; ref: React.Ref<PasswordDialogHandle> }

export function PasswordDialog({ email, ref }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [updateUserProfile] = useUpdateUserProfileMutation()

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }))

  const handleClose = () => {
    dialogRef.current?.close()
  }

  useClickOutside(dialogRef, handleClose)

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
        await updateUserProfile({
          password: values.newPassword,
          currentPassword: values.currentPassword,
        }).unwrap()
        handleClose()
        actions.resetForm()
        toast.success('Password changed successfully')
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            'Failed to change password, please try again later',
          ),
          { id: 'password-change-fail' },
        )
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
      onCancel={handleClose}
      aria-label="Change Password">
      <h2>Change Password</h2>
      <Formik
        initialValues={passwordChangeInitialValues}
        validationSchema={accountPasswordSchema}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <input
              type="hidden"
              name="email"
              value={email}
              autoComplete="username"
            />
            <p>Current Password</p>
            <FormikField
              name="currentPassword"
              placeholder="Current Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <p>New Password</p>
            <FormikField
              name="newPassword"
              placeholder="New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <p>Confirm New Password</p>
            <FormikField
              name="newPasswordConfirmation"
              placeholder="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="reset"
                title="Back"
                disabled={isSubmitting}
                onClick={handleClose}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <SpinnerIcon height={28} />} Submit
              </Button>
              <div style={{ width: '3rem' }} />
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledPasswordDialog>
  )
}
