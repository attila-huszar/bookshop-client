import { FC } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik, FormikHelpers } from 'formik'
import { addUser, updateUser } from '@/store'
import { Button, CountrySelect, FormikField } from '@/components'
import { useAppDispatch } from '@/hooks'
import { formatDate } from '@/helpers'
import { userSchema } from '@/validation'
import { UserRole, UserWithMetadata } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import {
  AddressBlock,
  FormButtons,
  FullRow,
  MetadataBlock,
  Row,
  SectionHeader,
  UserRoleRow,
} from '../../styles'

const initialUserValues: UserWithMetadata = {
  id: 0,
  uuid: '',
  email: '',
  firstName: '',
  lastName: '',
  country: '',
  role: UserRole.User,
  avatar: '',
  phone: '',
  address: {
    city: '',
    country: '',
    line1: '',
    line2: '',
    postal_code: '',
    state: '',
  },
  verified: false,
  verificationToken: null,
  verificationExpires: null,
  passwordResetToken: null,
  passwordResetExpires: null,
  createdAt: '',
  updatedAt: '',
}

type Props = {
  editedItem: UserWithMetadata | null
  onClose: () => void
}

export const UserEditForm: FC<Props> = ({ editedItem, onClose }) => {
  const dispatch = useAppDispatch()

  const handleSubmit = async (
    values: UserWithMetadata,
    actions: FormikHelpers<UserWithMetadata>,
  ) => {
    try {
      let result
      if (editedItem) {
        const {
          id,
          verificationToken,
          verificationExpires,
          passwordResetToken,
          passwordResetExpires,
          createdAt,
          updatedAt,
          ...userValues
        } = values
        result = await dispatch(updateUser(userValues))
      } else {
        const { id, ...userWithoutId } = values
        result = await dispatch(addUser(userWithoutId))
      }

      if (result?.meta?.requestStatus === 'fulfilled') {
        actions.resetForm()
        toast.success(`User ${editedItem ? 'updated' : 'added'} successfully`)
        onClose()
      } else {
        toast.error(`Failed to ${editedItem ? 'update' : 'add'} user`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    }
  }

  return (
    <Formik
      key="users"
      initialValues={editedItem ?? initialUserValues}
      validationSchema={userSchema}
      onSubmit={handleSubmit}>
      {({ dirty, isSubmitting }) => (
        <Form>
          {editedItem && (
            <>
              <SectionHeader>User Information</SectionHeader>
              <MetadataBlock>
                <div>
                  <p>User ID</p>
                  <span>{editedItem.id}</span>
                </div>
                <div>
                  <p>Created At</p>
                  <span>
                    {editedItem.createdAt
                      ? formatDate(editedItem.createdAt)
                      : '—'}
                  </span>
                </div>
                <div>
                  <p>Updated At</p>
                  <span>
                    {editedItem.updatedAt
                      ? formatDate(editedItem.updatedAt)
                      : '—'}
                  </span>
                </div>
              </MetadataBlock>
            </>
          )}
          <Row>
            <div>
              <p>First Name</p>
              <FormikField
                name="firstName"
                placeholder="First Name"
                type="text"
              />
            </div>
            <div>
              <p>Last Name</p>
              <FormikField
                name="lastName"
                placeholder="Last Name"
                type="text"
              />
            </div>
          </Row>
          <Row>
            <div>
              <p>Email</p>
              <FormikField name="email" placeholder="Email" type="email" />
            </div>
            <div>
              <p>Phone</p>
              <FormikField name="phone" placeholder="Phone" type="text" />
            </div>
          </Row>
          <Row>
            <div>
              <p>Country at Registration</p>
              <CountrySelect fieldName="country" />
            </div>
            <div>
              <p>Avatar URL</p>
              <FormikField name="avatar" placeholder="Avatar URL" type="text" />
            </div>
          </Row>
          <UserRoleRow>
            <div>
              <p>Role</p>
              <FormikField name="role" type="select">
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </FormikField>
            </div>
            <div className="centered-checkbox">
              <p>Verified</p>
              <div style={{ display: 'flex', height: '100%' }}>
                <FormikField name="verified" type="checkbox" />
              </div>
            </div>
          </UserRoleRow>
          <AddressBlock>
            <p>Address</p>
            <Row>
              <div>
                <p>Line 1</p>
                <FormikField
                  name="address.line1"
                  placeholder="Line 1"
                  type="text"
                />
              </div>
              <div>
                <p>Line 2</p>
                <FormikField
                  name="address.line2"
                  placeholder="Line 2"
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <p>City</p>
                <FormikField
                  name="address.city"
                  placeholder="City"
                  type="text"
                />
              </div>
              <div>
                <p>State</p>
                <FormikField
                  name="address.state"
                  placeholder="State"
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <p>Postal Code</p>
                <FormikField
                  name="address.postal_code"
                  placeholder="Postal Code"
                  type="text"
                />
              </div>
              <div>
                <p>Country</p>
                <CountrySelect fieldName="address.country" />
              </div>
            </Row>
          </AddressBlock>
          {editedItem && (
            <>
              <SectionHeader>Read-Only Metadata</SectionHeader>
              <FullRow>
                <div>
                  <p>UUID</p>
                  <FormikField name="uuid" type="text" readOnly />
                </div>
              </FullRow>
              <Row>
                <div>
                  <p>Verification Token</p>
                  <FormikField name="verificationToken" type="text" readOnly />
                </div>
                <div>
                  <p>Verification Expires</p>
                  <FormikField
                    name="verificationExpires"
                    type="text"
                    readOnly
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <p>Password Reset Token</p>
                  <FormikField name="passwordResetToken" type="text" readOnly />
                </div>
                <div>
                  <p>Password Reset Expires</p>
                  <FormikField
                    name="passwordResetExpires"
                    type="text"
                    readOnly
                  />
                </div>
              </Row>
            </>
          )}
          <FormButtons>
            <Button
              type="reset"
              onClick={onClose}
              $size="sm"
              $inverted
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" $size="sm" disabled={!dirty || isSubmitting}>
              {isSubmitting ? <SpinnerIcon height={22} /> : 'Save'}
            </Button>
          </FormButtons>
        </Form>
      )}
    </Formik>
  )
}
