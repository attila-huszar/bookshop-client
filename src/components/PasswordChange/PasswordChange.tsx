import { Formik, Form } from 'formik'
import { Button, FormikField } from '../../components'
import { StyledPasswordChange } from './PasswordChange.styles'
import { ButtonWrapper } from '../../styles/Form.styles'
import { passwordChangeInitialValues } from '../../lib/defaultValues'
import { accountPasswordSchema } from '../../utils/validationSchema'

export function PasswordChange({ onClose }: { onClose: () => void }) {
  return (
    <StyledPasswordChange>
      <h2>Change Password</h2>
      <Formik
        initialValues={passwordChangeInitialValues}
        validationSchema={accountPasswordSchema}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false)
        }}>
        {({ isSubmitting }) => (
          <Form>
            <div>
              <p>Current Password</p>
              <FormikField
                name="currentPassword"
                placeholder="Current Password"
                type="password"
              />
            </div>
            <div>
              <p>New Password</p>
              <FormikField
                name="newPassword"
                placeholder="New Password"
                type="password"
              />
            </div>
            <div>
              <p>Confirm New Password</p>
              <FormikField
                name="newPasswordConfirm"
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
}
