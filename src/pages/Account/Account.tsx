import { ChangeEvent, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik } from 'formik'
import { updateAvatar, updateUserProfile, userSelector } from '@/store'
import {
  Avatar,
  Button,
  CountrySelect,
  FormikField,
  IconButton,
  PasswordDialog,
} from '@/components'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  accountBasicSchema,
  addressSchema,
  validateImageFile,
} from '@/validation'
import type { StripeAddress, UserUpdate } from '@/types'
import { EditIcon } from '@/assets/svg'
import {
  Address,
  AddressLine,
  AvatarPanel,
  ButtonWrapper,
  Details,
  General,
  GeneralLine,
  StyledAccount,
  UserDataFields,
} from './Account.style'

export function Account() {
  const { userData, userIsUpdating } = useAppSelector(userSelector)
  const [editingUserInfo, setEditingUserInfo] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)
  const passwordDialog = useRef<HTMLDialogElement>(null)
  const dispatch = useAppDispatch()

  if (!userData) return null

  const handleUserInfoSubmit = async (values: UserUpdate) => {
    await dispatch(updateUserProfile(values))
    setEditingUserInfo(false)
  }

  const handleAddressSubmit = async (values: StripeAddress) => {
    const updateData: UserUpdate = {
      address: {
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country,
      },
    }
    await dispatch(updateUserProfile(updateData))
    setEditingAddress(false)
  }

  const handleUserInfoReset = () => setEditingUserInfo(false)
  const handleAddressReset = () => setEditingAddress(false)
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
    if (file) formData.append('avatar', file)
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
    const { email, firstName, lastName, phone, address, avatar, country } =
      userData

    const defaultCountry =
      address && 'country' in address ? address.country! : country

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
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                  }}
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
                    phone: phone || '',
                  }}
                  enableReinitialize
                  validationSchema={accountBasicSchema}
                  onSubmit={handleUserInfoSubmit}
                  onReset={handleUserInfoReset}>
                  {({ dirty }) => (
                    <Form>
                      <GeneralLine>
                        <div>
                          <p>First name</p>
                          <FormikField
                            name="firstName"
                            placeholder="First name"
                            type="text"
                            readOnly={!editingUserInfo}
                          />
                        </div>
                        <div>
                          <p>Last name</p>
                          <FormikField
                            name="lastName"
                            placeholder="Last name"
                            type="text"
                            readOnly={!editingUserInfo}
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
                            readOnly={!editingUserInfo}
                          />
                        </div>
                      </GeneralLine>
                      {editingUserInfo && (
                        <ButtonWrapper>
                          <Button type="reset" $size="sm" $inverted>
                            Cancel
                          </Button>
                          <Button
                            $size="sm"
                            type="submit"
                            disabled={userIsUpdating || !dirty}>
                            {userIsUpdating ? 'Saving...' : 'Save'}
                          </Button>
                        </ButtonWrapper>
                      )}
                    </Form>
                  )}
                </Formik>
              </General>
            </div>
            <IconButton
              onClick={() => setEditingUserInfo(true)}
              icon={<EditIcon />}
              title="Edit contact info"
              disabled={editingUserInfo}
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
                validationSchema={addressSchema}
                onSubmit={handleAddressSubmit}
                onReset={handleAddressReset}>
                {({ dirty }) => (
                  <Form>
                    <AddressLine>
                      <div>
                        <p>Address line 1</p>
                        <FormikField
                          name="line1"
                          placeholder="Address line 1"
                          type="text"
                          readOnly={!editingAddress}
                        />
                      </div>
                      <div>
                        <p>Address line 2 (optional)</p>
                        <FormikField
                          name="line2"
                          placeholder="Address line 2"
                          type="text"
                          readOnly={!editingAddress}
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
                          readOnly={!editingAddress}
                        />
                      </div>
                      <div>
                        <p>State</p>
                        <FormikField
                          name="state"
                          placeholder="State"
                          type="text"
                          readOnly={!editingAddress}
                        />
                      </div>
                      <div>
                        <p>Postal Code</p>
                        <FormikField
                          name="postal_code"
                          placeholder="Postal Code"
                          type="text"
                          readOnly={!editingAddress}
                        />
                      </div>
                    </AddressLine>
                    <AddressLine>
                      <div>
                        <p>Country</p>
                        <CountrySelect
                          initial={defaultCountry}
                          readOnly={!editingAddress}
                        />
                      </div>
                    </AddressLine>
                    {editingAddress && (
                      <ButtonWrapper>
                        <Button $size="sm" type="reset" $inverted>
                          Cancel
                        </Button>
                        <Button
                          $size="sm"
                          type="submit"
                          disabled={userIsUpdating || !dirty}>
                          {userIsUpdating ? 'Saving...' : 'Save'}
                        </Button>
                      </ButtonWrapper>
                    )}
                  </Form>
                )}
              </Formik>
            </Address>
            <IconButton
              onClick={() => setEditingAddress(true)}
              icon={<EditIcon />}
              title="Edit address"
              disabled={editingAddress}
            />
          </Details>
        </UserDataFields>
      </StyledAccount>
    )
  }
}
