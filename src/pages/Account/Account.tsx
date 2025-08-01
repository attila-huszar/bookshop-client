import { useState, useRef, ChangeEvent } from 'react'
import { Form, Formik } from 'formik'
import toast from 'react-hot-toast'
import {
  StyledAccount,
  UserDataFields,
  Details,
  General,
  GeneralLine,
  AvatarPanel,
  Address,
  AddressLine,
  ButtonWrapper,
} from './Account.style'
import { Avatar, Button, FormikField, IconButton } from '@/components'
import { PasswordDialog } from './components/PasswordDialog/PasswordDialog'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { userSelector, updateUser, updateAvatar } from '@/store'
import { countryList } from '@/constants'
import {
  accountBasicSchema,
  accountAddressSchema,
  validateImageFile,
} from '@/validation'
import { EditIcon } from '@/assets/svg'
import type { User } from '@/types'

export function Account() {
  const { userData, userIsUpdating } = useAppSelector(userSelector)
  const [editingBasicInfo, setEditingBasicInfo] = useState(false)
  const [editingAddressInfo, setEditingAddressInfo] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)
  const passwordDialog = useRef<HTMLDialogElement>(null)
  const dispatch = useAppDispatch()

  const handleBasicInfoSubmit = (values: Partial<User>) => {
    void dispatch(updateUser({ ...values }))
  }

  const handleAddressInfoSubmit = (values: User['address']) => {
    void dispatch(updateUser({ address: values }))
  }

  const handleBasicInfoReset = () => setEditingBasicInfo(false)
  const handleAddressInfoReset = () => setEditingAddressInfo(false)
  const handleAvatarClick = () => inputFile.current?.click()

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target
    const files = fileInput.files

    if (!files || files.length === 0) return

    const file = files[0]
    const { valid, error } = validateImageFile(file)

    if (!valid && error) {
      toast.error(error, { id: 'upload-error' })
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)
    void uploadAvatarFile(formData)

    fileInput.value = ''
  }

  const uploadAvatarFile = async (formData: FormData) => {
    toast.loading('Uploading avatar...', { id: 'avatar-upload' })

    const result = await dispatch(updateAvatar(formData))

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Avatar updated successfully', { id: 'avatar-upload' })
    } else {
      toast.error('Failed to update avatar, please try again later', {
        id: 'avatar-upload',
      })
    }
  }

  const handlePasswordDialogOpen = () => {
    passwordDialog.current?.showModal()
  }

  if (userData) {
    const { email, firstName, lastName, phone, address, avatar } = userData

    return (
      <StyledAccount>
        <h2>
          Hello, <span>{firstName}</span>!
        </h2>
        <UserDataFields>
          <Details>
            <h5>General Information</h5>
            <div>
              <AvatarPanel>
                <Avatar
                  imgUrl={avatar}
                  onClick={handleAvatarClick}
                  title="Change Profile Picture"
                  $size={160}
                  $hoverControls
                />
                <input
                  type="file"
                  name="avatarChangeInput"
                  aria-label="Change Avatar"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  ref={inputFile}
                  style={{ display: 'none' }}
                />
                <Button
                  onClick={handlePasswordDialogOpen}
                  $size="smMd"
                  $textSize="sm">
                  Change Password
                </Button>
                <PasswordDialog ref={passwordDialog} email={email} />
              </AvatarPanel>
              <General>
                <Formik
                  initialValues={{
                    firstName,
                    lastName,
                    email,
                    phone: phone ?? '',
                  }}
                  enableReinitialize
                  validationSchema={accountBasicSchema}
                  onSubmit={handleBasicInfoSubmit}
                  onReset={handleBasicInfoReset}>
                  <Form>
                    <GeneralLine>
                      <div>
                        <p>First name</p>
                        <FormikField
                          name="firstName"
                          placeholder="First name"
                          type="text"
                          readOnly={!editingBasicInfo}
                        />
                      </div>
                      <div>
                        <p>Last name</p>
                        <FormikField
                          name="lastName"
                          placeholder="Last name"
                          type="text"
                          readOnly={!editingBasicInfo}
                        />
                      </div>
                    </GeneralLine>
                    <GeneralLine>
                      <div>
                        <p>Email</p>
                        <FormikField
                          name="email"
                          placeholder="Email"
                          type="email"
                          readOnly
                        />
                      </div>
                      <div>
                        <p>Phone</p>
                        <FormikField
                          name="phone"
                          placeholder="Phone"
                          type="tel"
                          inputMode="numeric"
                          readOnly={!editingBasicInfo}
                        />
                      </div>
                    </GeneralLine>
                    {editingBasicInfo && (
                      <ButtonWrapper>
                        <Button type="reset" $size="sm" $inverted>
                          Cancel
                        </Button>
                        <Button
                          $size="sm"
                          type="submit"
                          disabled={userIsUpdating}>
                          {userIsUpdating ? 'Saving...' : 'Save'}
                        </Button>
                      </ButtonWrapper>
                    )}
                  </Form>
                </Formik>
              </General>
            </div>
            <IconButton
              onClick={() => setEditingBasicInfo(true)}
              icon={<EditIcon />}
              title="Edit contact info"
              disabled={editingBasicInfo}
            />
          </Details>
          <Details>
            <h5>Address</h5>
            <Address>
              <Formik
                initialValues={{
                  line1: address && 'line1' in address ? address.line1 : '',
                  line2: address && 'line2' in address ? address.line2 : '',
                  city: address && 'city' in address ? address.city : '',
                  state: address && 'state' in address ? address.state : '',
                  postal_code:
                    address && 'postal_code' in address
                      ? address.postal_code
                      : '',
                  country:
                    address && 'country' in address ? address.country : '',
                }}
                enableReinitialize
                validationSchema={accountAddressSchema}
                onSubmit={handleAddressInfoSubmit}
                onReset={handleAddressInfoReset}>
                <Form>
                  <AddressLine>
                    <div>
                      <p>Address line 1</p>
                      <FormikField
                        name="line1"
                        placeholder="Address line 1"
                        type="text"
                        readOnly={!editingAddressInfo}
                      />
                    </div>
                    <div>
                      <p>Address line 2 (optional)</p>
                      <FormikField
                        name="line2"
                        placeholder="Address line 2"
                        type="text"
                        readOnly={!editingAddressInfo}
                      />
                    </div>
                  </AddressLine>
                  <AddressLine>
                    <div>
                      <p>City</p>
                      <FormikField
                        name="city"
                        placeholder="City"
                        type="text"
                        readOnly={!editingAddressInfo}
                      />
                    </div>
                    <div>
                      <p>State</p>
                      <FormikField
                        name="state"
                        placeholder="State"
                        type="text"
                        readOnly={!editingAddressInfo}
                      />
                    </div>
                    <div>
                      <p>Postal Code</p>
                      <FormikField
                        name="postal_code"
                        placeholder="Postal Code"
                        type="text"
                        readOnly={!editingAddressInfo}
                      />
                    </div>
                  </AddressLine>
                  <AddressLine>
                    <div>
                      <p>Country</p>
                      <FormikField
                        name="country"
                        type="select"
                        readOnly={!editingAddressInfo}>
                        <option value="" hidden>
                          Please select a country...
                        </option>
                        {countryList.map((country) => (
                          <option key={country.code} value={country.code}>
                            {`${country.flag} ${country.name}`}
                          </option>
                        ))}
                      </FormikField>
                    </div>
                  </AddressLine>
                  {editingAddressInfo && (
                    <ButtonWrapper>
                      <Button $size="sm" type="reset" $inverted>
                        Cancel
                      </Button>
                      <Button
                        $size="sm"
                        type="submit"
                        disabled={userIsUpdating}>
                        {userIsUpdating ? 'Saving...' : 'Save'}
                      </Button>
                    </ButtonWrapper>
                  )}
                </Form>
              </Formik>
            </Address>
            <IconButton
              onClick={() => setEditingAddressInfo(true)}
              icon={<EditIcon />}
              title="Edit address"
              disabled={editingAddressInfo}
            />
          </Details>
        </UserDataFields>
      </StyledAccount>
    )
  }
}
