import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Avatar,
  Button,
  FormikField,
  IconButton,
  PasswordChange,
} from '../../components'
import { useAppSelector } from '../../hooks'
import { userSelector } from '../../store'
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
import {
  accountGeneralSchema,
  accountAddressSchema,
} from '../../utils/validationSchema'
import { IUserOmitPassword } from '../../interfaces'
import EditIcon from '../../assets/svg/edit.svg?react'

export function Account() {
  const { userData } = useAppSelector(userSelector)
  const {
    firstName,
    lastName,
    email,
    phone,
    address: { street, number, city, state, postCode, country } = {},
  } = userData as IUserOmitPassword
  const [editingGeneral, setEditingGeneral] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const generalInfo = {
    firstName,
    lastName,
    email,
    phone,
  }

  const addressInfo = {
    street,
    number,
    city,
    state,
    postCode,
    country,
  }

  const openPasswordModal = () => setShowPasswordModal(true)
  const handleResetGeneral = () => setEditingGeneral(false)
  const handleResetAddress = () => setEditingAddress(false)

  return (
    <StyledAccount>
      <h2>
        Hello, <span>{userData?.firstName}</span>!
      </h2>
      <UserDataFields>
        <Details>
          <h5>General Information</h5>
          <div>
            <AvatarPanel>
              <Avatar
                imgUrl={userData?.avatar as string}
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
                    onClose={() => setShowPasswordModal(false)}
                  />,
                  document.getElementById('root')!,
                )}
            </AvatarPanel>
            <General>
              <Formik
                initialValues={generalInfo}
                validationSchema={accountGeneralSchema}
                onSubmit={(values, actions) => {
                  actions.setSubmitting(false)
                }}
                onReset={handleResetGeneral}>
                {({ isSubmitting }) => (
                  <Form>
                    <GeneralLine>
                      <div>
                        <p>First name</p>
                        <FormikField
                          name="firstName"
                          placeholder="First name"
                          type="text"
                          readOnly={!editingGeneral}
                        />
                      </div>
                      <div>
                        <p>Last name</p>
                        <FormikField
                          name="lastName"
                          placeholder="Last name"
                          type="text"
                          readOnly={!editingGeneral}
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
                          readOnly={!editingGeneral}
                        />
                      </div>
                    </GeneralLine>
                    {editingGeneral && (
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
            </General>
          </div>
          {!editingGeneral && (
            <IconButton
              onClick={() => setEditingGeneral((prev) => !prev)}
              icon={<EditIcon />}
            />
          )}
        </Details>
        <Details>
          <h5>Address</h5>
          <Address>
            <Formik
              initialValues={addressInfo}
              validationSchema={accountAddressSchema}
              onSubmit={(values, actions) => {
                actions.setSubmitting(false)
              }}
              onReset={handleResetAddress}>
              {({ isSubmitting }) => (
                <Form>
                  <AddressLine>
                    <div>
                      <p>Street</p>
                      <FormikField
                        name="street"
                        placeholder="Street"
                        type="text"
                        readOnly={!editingAddress}
                      />
                    </div>
                    <div>
                      <p>Number</p>
                      <FormikField
                        name="number"
                        placeholder="Number"
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
                      <p>Post Code</p>
                      <FormikField
                        name="postCode"
                        placeholder="Post Code"
                        type="text"
                        readOnly={!editingAddress}
                      />
                    </div>
                  </AddressLine>
                  <AddressLine>
                    <div>
                      <p>Country</p>
                      <FormikField
                        name="country"
                        placeholder="Country"
                        type="text"
                        readOnly={!editingAddress}
                      />
                    </div>
                  </AddressLine>
                  {editingAddress && (
                    <ButtonWrapper>
                      <Button $size="sm" type="reset" $inverted>
                        Cancel
                      </Button>
                      <Button $size="sm" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </ButtonWrapper>
                  )}
                </Form>
              )}
            </Formik>
          </Address>
          {!editingAddress && (
            <IconButton
              onClick={() => setEditingAddress((prev) => !prev)}
              icon={<EditIcon />}
            />
          )}
        </Details>
      </UserDataFields>
    </StyledAccount>
  )
}
