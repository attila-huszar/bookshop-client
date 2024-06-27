import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { Form, Formik } from 'formik'
import { StyledForgotPassword } from './ForgotPassword.styles'
import { Button, FormikField, IconButton } from 'components'
import { ButtonWrapper } from 'styles/Form.styles'
import BackIcon from 'assets/svg/chevron_left_circle.svg?react'
import toast from 'react-hot-toast'

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
    handleClose()
    actions.resetForm()
    toast.success(`Email sent to ${values.email}`)
  }

  return (
    <StyledForgotPassword ref={forgotPassRef}>
      <h2>Forgotten Password</h2>
      <Formik
        initialValues={{
          email: '',
        }}
        onSubmit={(values, actions) => handleSubmit(values, actions)}>
        {({ isSubmitting }) => (
          <Form>
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
