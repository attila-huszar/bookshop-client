import { FC } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik, FormikHelpers, FormikState } from 'formik'
import { addUser, updateUser } from '@/store'
import { Button, FormikField } from '@/components'
import { useAppDispatch } from '@/hooks'
import { formatDate } from '@/helpers'
import { userSchema } from '@/validation'
import { UserFormValues, UserRole, UserUpdate, UserWithMetadata } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import {
  AddressBlock,
  DefaultRow,
  FormButtons,
  MetadataBlock,
  SectionHeader,
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
    values: UserFormValues,
    actions: FormikHelpers<UserFormValues>,
  ) => {
    try {
      let result
      if (editedItem) {
        result = await dispatch(updateUser(values as UserUpdate))
      } else {
        result = await dispatch(addUser(values as Omit<UserWithMetadata, 'id'>))
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

  const renderButtons = ({ isSubmitting }: Partial<FormikState<unknown>>) => (
    <FormButtons>
      <Button type="reset" onClick={onClose} $size="sm" $inverted>
        Cancel
      </Button>
      <Button type="submit" $size="sm">
        {isSubmitting ? <SpinnerIcon height={22} /> : 'Save'}
      </Button>
    </FormButtons>
  )

  const renderAddressBlock = () => (
    <AddressBlock>
      <p>Address</p>
      <DefaultRow>
        <div>
          <p>Line 1</p>
          <FormikField
            name="shipping.address.line1"
            placeholder="Line 1"
            type="text"
          />
        </div>
        <div>
          <p>Line 2</p>
          <FormikField
            name="shipping.address.line2"
            placeholder="Line 2"
            type="text"
          />
        </div>
      </DefaultRow>
      <DefaultRow>
        <div>
          <p>City</p>
          <FormikField
            name="shipping.address.city"
            placeholder="City"
            type="text"
          />
        </div>
        <div>
          <p>State</p>
          <FormikField
            name="shipping.address.state"
            placeholder="State"
            type="text"
          />
        </div>
      </DefaultRow>
      <DefaultRow>
        <div>
          <p>Postal Code</p>
          <FormikField
            name="shipping.address.postal_code"
            placeholder="Postal Code"
            type="text"
          />
        </div>
        <div>
          <p>Country</p>
          <FormikField
            name="shipping.address.country"
            placeholder="Country"
            type="text"
          />
        </div>
      </DefaultRow>
    </AddressBlock>
  )

  return (
    <Formik
      key="users"
      initialValues={(editedItem as UserFormValues) ?? initialUserValues}
      validationSchema={userSchema}
      onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form>
          {editedItem && 'id' in editedItem && (
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
          <DefaultRow>
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
          </DefaultRow>
          <DefaultRow>
            <div>
              <p>Email</p>
              <FormikField name="email" placeholder="Email" type="email" />
            </div>
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
          </DefaultRow>
          <DefaultRow>
            <div>
              <p>Phone</p>
              <FormikField name="phone" placeholder="Phone" type="text" />
            </div>
            <div>
              <p>Avatar URL</p>
              <FormikField name="avatar" placeholder="Avatar URL" type="text" />
            </div>
          </DefaultRow>
          {renderAddressBlock()}
          {renderButtons({ isSubmitting })}
        </Form>
      )}
    </Formik>
  )
}
