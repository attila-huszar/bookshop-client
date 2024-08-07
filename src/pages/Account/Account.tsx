import { useState, useRef, ChangeEvent } from 'react'
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
} from './Account.styles'
import { Avatar, Button, FormikField, IconButton } from 'components'
import { PasswordDialogRef } from './components/PasswordDialog/PasswordDialog'
import { useAppDispatch, useAppSelector } from 'hooks'
import { userSelector, updateUser } from 'store'
import { uploadImage } from 'api/fetchData'
import { Form, Formik } from 'formik'
import { countryList } from 'lib'
import { accountBasicSchema, accountAddressSchema } from 'helpers'
import { IUserToStore } from 'interfaces'
import EditIcon from 'assets/svg/edit.svg?react'
import toast from 'react-hot-toast'

export function Account() {
  const { userData, userIsUpdating } = useAppSelector(userSelector)
  const { uuid, firstName, lastName, email, phone, avatar, address } = {
    ...userData,
  } as IUserToStore
  const [editingBasicInfo, setEditingBasicInfo] = useState(false)
  const [editingAddressInfo, setEditingAddressInfo] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)
  const passwordDialog = useRef<HTMLDialogElement>(null)
  const dispatch = useAppDispatch()

  const handleBasicInfoSubmit = (values: Partial<IUserToStore>) => {
    dispatch(
      updateUser({
        uuid: uuid as string,
        fields: { ...values },
      }),
    )
  }

  const handleAddressInfoSubmit = (values: IUserToStore['address']) => {
    dispatch(
      updateUser({
        uuid: uuid as string,
        fields: { address: values },
      }),
    )
  }

  const handleBasicInfoReset = () => setEditingBasicInfo(false)
  const handleAddressInfoReset = () => setEditingAddressInfo(false)
  const handleAvatarClick = () => {
    inputFile.current?.click()
  }

  const handleImgChange = async (img: File) => {
    try {
      const imageResponse = await uploadImage(img, 'avatars')

      dispatch(
        updateUser({
          uuid: uuid as string,
          fields: { avatar: imageResponse.url },
        }),
      )
    } catch {
      toast.error('Image upload failed')
    }
  }

  const handlePasswordDialogOpen = () => {
    passwordDialog.current?.showModal()
  }

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
                imgUrl={avatar as string}
                onClick={handleAvatarClick}
                title="Change Profile Picture"
                $size={160}
                $clip
                $camera
              />
              <input
                type="file"
                name="avatarChangeInput"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (!e.target.files) return
                  handleImgChange(e.target.files[0])
                }}
                accept="image/*"
                ref={inputFile}
                style={{ display: 'none' }}
              />
              <Button
                onClick={handlePasswordDialogOpen}
                $size="sm"
                $textSize="sm">
                Change Password
              </Button>
              <PasswordDialogRef ref={passwordDialog} uuid={uuid as string} />
            </AvatarPanel>
            <General>
              {userData && (
                <Formik
                  initialValues={{ firstName, lastName, email, phone }}
                  enableReinitialize
                  validationSchema={accountBasicSchema}
                  onSubmit={(values) => handleBasicInfoSubmit(values)}
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
              )}
            </General>
          </div>
          {!editingBasicInfo && (
            <IconButton
              onClick={() => setEditingBasicInfo((prev) => !prev)}
              icon={<EditIcon />}
            />
          )}
        </Details>
        <Details>
          <h5>Address</h5>
          <Address>
            {userData && (
              <Formik
                initialValues={{
                  line1: address.line1,
                  line2: address.line2,
                  city: address.city,
                  state: address.state,
                  postal_code: address.postal_code,
                  country: address.country,
                }}
                enableReinitialize
                validationSchema={accountAddressSchema}
                onSubmit={(values: IUserToStore['address']) =>
                  handleAddressInfoSubmit(values)
                }
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
            )}
          </Address>
          {!editingAddressInfo && (
            <IconButton
              onClick={() => setEditingAddressInfo((prev) => !prev)}
              icon={<EditIcon />}
            />
          )}
        </Details>
      </UserDataFields>
    </StyledAccount>
  )
}
