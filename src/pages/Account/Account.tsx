import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Avatar,
  Button,
  FormikField,
  IconButton,
  PasswordChange,
} from '../../components'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { userSelector, updateUser } from '../../store'
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
import { Form, Formik } from 'formik'
import { countryList } from '../../lib'
import { accountBasicSchema, accountAddressSchema } from '../../utils'
import { IUserOmitPassword, IAddress } from '../../interfaces'
import EditIcon from '../../assets/svg/edit.svg?react'

export function Account() {
  const { userData } = useAppSelector(userSelector)
  const { uuid, firstName, lastName, email, phone, avatar, address } = {
    ...userData,
  } as IUserOmitPassword
  const [editingBasicInfo, setEditingBasicInfo] = useState(false)
  const [editingAddressInfo, setEditingAddressInfo] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const dispatch = useAppDispatch()

  const handleBasicInfoSubmit = (values: Partial<IUserOmitPassword>) => {
    dispatch(
      updateUser({
        uuid: uuid as string,
        fields: { ...values },
      }),
    )
  }

  const handleAddressInfoSubmit = (values: IAddress) => {
    dispatch(
      updateUser({
        uuid: uuid as string,
        fields: { ...userData, address: values },
      }),
    )
  }

  const handleBasicInfoReset = () => setEditingBasicInfo(false)

  const handleAddressInfoReset = () => setEditingAddressInfo(false)

  const openPasswordModal = () => setShowPasswordModal(true)

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
                title="Change Profile Picture"
                $size={160}
                $clip
                $camera
              />
              <Button onClick={openPasswordModal} $size="sm" $textSize="sm">
                Change Password
              </Button>
              {showPasswordModal &&
                createPortal(
                  <PasswordChange
                    uuid={uuid as string}
                    onClose={() => setShowPasswordModal(false)}
                  />,
                  document.getElementById('root')!,
                )}
            </AvatarPanel>
            <General>
              {userData && (
                <Formik
                  initialValues={{ firstName, lastName, email, phone }}
                  enableReinitialize
                  validationSchema={accountBasicSchema}
                  onSubmit={(values) => handleBasicInfoSubmit(values)}
                  onReset={handleBasicInfoReset}>
                  {({ values, handleChange, isSubmitting }) => (
                    <Form>
                      <GeneralLine>
                        <div>
                          <p>First name</p>
                          <FormikField
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            type="text"
                            readOnly={!editingBasicInfo}
                          />
                        </div>
                        <div>
                          <p>Last name</p>
                          <FormikField
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
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
                            value={values.email}
                            onChange={handleChange}
                            placeholder="Email"
                            type="email"
                            readOnly
                          />
                        </div>
                        <div>
                          <p>Phone</p>
                          <FormikField
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
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
                            disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </Button>
                        </ButtonWrapper>
                      )}
                    </Form>
                  )}
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
                  street: address.street,
                  number: address.number,
                  city: address.city,
                  state: address.state,
                  postCode: address.postCode,
                  country: address.country,
                }}
                enableReinitialize
                validationSchema={accountAddressSchema}
                onSubmit={(values: IAddress) => handleAddressInfoSubmit(values)}
                onReset={handleAddressInfoReset}>
                {({ values, handleChange, isSubmitting }) => (
                  <Form>
                    <AddressLine>
                      <div>
                        <p>Street</p>
                        <FormikField
                          name="street"
                          value={values.street}
                          onChange={handleChange}
                          placeholder="Street"
                          type="text"
                          readOnly={!editingAddressInfo}
                        />
                      </div>
                      <div>
                        <p>Number</p>
                        <FormikField
                          name="number"
                          value={values.number}
                          onChange={handleChange}
                          placeholder="Number"
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
                          value={values.city}
                          onChange={handleChange}
                          placeholder="City"
                          type="text"
                          readOnly={!editingAddressInfo}
                        />
                      </div>
                      <div>
                        <p>State</p>
                        <FormikField
                          name="state"
                          value={values.state}
                          onChange={handleChange}
                          placeholder="State"
                          type="text"
                          readOnly={!editingAddressInfo}
                        />
                      </div>
                      <div>
                        <p>Post Code</p>
                        <FormikField
                          name="postCode"
                          value={values.postCode}
                          onChange={handleChange}
                          placeholder="Post Code"
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
                          value={values.country}
                          onChange={handleChange}
                          type="select"
                          readOnly={!editingAddressInfo}>
                          <option value="" hidden>
                            Please select a country...
                          </option>
                          {countryList.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.name}
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
                          disabled={isSubmitting}>
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                      </ButtonWrapper>
                    )}
                  </Form>
                )}
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
