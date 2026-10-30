import { useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Formik } from 'formik'
import { useUpdateUserProfileMutation } from '@/store/api/usersApi'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { FormikField } from '@/components/FormikField'
import { useClickOutside } from '@/hooks/useClickOutside'
import { getErrorMessage } from '@/helpers/errors'
import { accountPasswordSchema } from '@/validation/userSchemas'
import { passwordChangeInitialValues } from '@/constants/defaultValues'
import { SpinnerIcon, XIcon } from '@/assets/svg'
import {
  DialogBody,
  DialogCloseButton,
  DialogHeader,
} from '@/styles/dialog.styles'
import { ButtonWrapper } from '@/styles/form.styles'
import { StyledPasswordDialog } from './PasswordDialog.style'

type PasswordDialogHandle = {
  showModal: () => void
  close: () => void
}

type Props = { email: string; ref: React.Ref<PasswordDialogHandle> }

export function PasswordDialog({ email, ref }: Props) {
  const { t } = useTranslation()

  const dialogRef = useRef<HTMLDialogElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [updateUserProfile, passwordUpdate] = useUpdateUserProfileMutation()

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
        toast.success(t('auth.passwordChanged'))
      } catch (error) {
        toast.error(getErrorMessage(error, t('auth.passwordChangeError')), {
          id: 'password-change-fail',
        })
      }
    } else {
      toast.error(t('auth.passwordDifferent'), {
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
      aria-label={t('auth.changePassword')}>
      <DialogHeader>
        <h2>{t('auth.changePassword')}</h2>
        <DialogCloseButton
          type="button"
          aria-label={t('common.actions.close')}
          title={t('common.actions.close')}
          icon={<XIcon aria-hidden="true" />}
          disabled={passwordUpdate.isLoading}
          onClick={handleClose}
        />
      </DialogHeader>
      <DialogBody>
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
              <p>{t('auth.currentPassword')}</p>
              <FormikField
                name="currentPassword"
                placeholder={t('auth.currentPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <p>{t('auth.newPassword')}</p>
              <FormikField
                name="newPassword"
                placeholder={t('auth.newPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <p>{t('auth.confirmNewPassword')}</p>
              <FormikField
                name="newPasswordConfirmation"
                placeholder={t('auth.confirmNewPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <ButtonWrapper>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <SpinnerIcon height={28} />}
                  {t('common.actions.submit')}
                </Button>
              </ButtonWrapper>
            </Form>
          )}
        </Formik>
      </DialogBody>
    </StyledPasswordDialog>
  )
}
