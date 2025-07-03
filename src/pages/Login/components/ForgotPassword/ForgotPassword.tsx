import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { Form, Formik } from 'formik'
import { toast } from 'react-hot-toast'
import { StyledForgotPassword } from './ForgotPassword.style'
import { Button, FormikField, IconButton } from '@/components'
import { ButtonWrapper } from '@/styles/Form.style'
import { postPasswordReset } from '@/api'
import { forgotPasswordSchema } from '@/helpers'
import { handleError } from '@/errors'
import { BackIcon } from '@/assets/svg'

function ForgotPassword(
  _props: unknown,
  ref: ForwardedRef<Partial<HTMLDialogElement>>,
) {
  const forgotPassRef = useRef<HTMLDialogElement>(null)

  useImperativeHandle(ref, () => ({
    showModal: () => forgotPassRef.current?.showModal(),
    close: () => forgotPassRef.current?.close(),
  }))

  const handleClose = () => {
    forgotPassRef.current?.close()
  }

  const handleSubmit = async (
    values: {
      email: string
    },
    actions: { resetForm: () => void },
  ) => {
    try {
      const resetResponse = await postPasswordReset(values.email)

      toast.success(resetResponse.message, {
        id: 'passwordReset',
      })

      handleClose()
      actions.resetForm()
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: 'Password reset failed, please try again later',
      })

      toast.error(formattedError.message, { id: 'passwordReset' })
    }
  }

  return (
    <StyledForgotPassword ref={forgotPassRef}>
      <h2>Forgotten Password</h2>
      <p>
        {
          "Enter your email address and we'll send you a link to reset your password."
        }
      </p>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={forgotPasswordSchema}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>Email</p>
            <FormikField name="email" placeholder="Email" type="email" />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $iconSize="lg"
                $color="var(--mid-grey)"
                type="reset"
                title="Back"
                disabled={isSubmitting}
                onClick={handleClose}
              />
              <Button type="submit" $size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Email'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </StyledForgotPassword>
  )
}

export const ForgotPasswordRef = forwardRef(ForgotPassword)
