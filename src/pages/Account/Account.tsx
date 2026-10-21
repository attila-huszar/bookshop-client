import { ChangeEvent, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Form, Formik } from 'formik'
import {
  useUpdateAvatarMutation,
  useUpdateUserProfileMutation,
} from '@/store/api/bookshopApi'
import { userSelector } from '@/store/selectors'
import { Alert } from '@/components/Alert'
import { toast } from '@/components/AppToaster'
import { Avatar } from '@/components/Avatar'
import { Button, IconButton } from '@/components/Button'
import { CountrySelect } from '@/components/CountrySelect'
import { FormikField } from '@/components/FormikField'
import { Loading } from '@/components/Loading'
import { PasswordDialog } from '@/components/PasswordDialog'
import { useAppSelector } from '@/hooks/redux'
import { getErrorMessage } from '@/helpers/errors'
import { validateImageFile } from '@/validation/fileSchemas'
import { accountBasicSchema, addressSchema } from '@/validation/userSchemas'
import type { StripeAddress, UserProfileUpdate } from '@/types'
import { EditIcon, SpinnerIcon } from '@/assets/svg'
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
  const { t } = useTranslation()

  const { userData, userIsLoading, userError } = useAppSelector(userSelector)
  const [updateUserProfile, profileUpdate] = useUpdateUserProfileMutation()
  const [updateAvatar, avatarUpdate] = useUpdateAvatarMutation()
  const userIsUpdating = profileUpdate.isLoading || avatarUpdate.isLoading
  const [editingUserInfo, setEditingUserInfo] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)
  const passwordDialog = useRef<HTMLDialogElement>(null)

  if (userIsLoading) {
    return <Loading message={t('account.loading')} fullScreen />
  }

  if (!userData) {
    return <Alert message={t('account.error')} error={userError ?? undefined} />
  }

  const handleUserInfoSubmit = async (
    values: Pick<UserProfileUpdate, 'firstName' | 'lastName' | 'phone'>,
  ) => {
    try {
      await updateUserProfile(values).unwrap()
      setEditingUserInfo(false)
    } catch (error) {
      toast.error(getErrorMessage(error, t('account.updateError')))
    }
  }

  const handleAddressSubmit = async (values: StripeAddress) => {
    try {
      await updateUserProfile({ address: values }).unwrap()
      setEditingAddress(false)
    } catch (error) {
      toast.error(getErrorMessage(error, t('account.addressError')))
    }
  }

  const handleUserInfoReset = () => setEditingUserInfo(false)
  const handleAddressReset = () => setEditingAddress(false)
  const handleAvatarClick = () => inputFile.current?.click()

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target
    const files = fileInput.files
    const file = files?.[0]

    if (!file) {
      return
    }

    fileInput.value = ''
    const { valid, error } = validateImageFile(file)

    if (!valid && error) {
      toast.error(error, { id: 'upload-error' })
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)
    void uploadAvatarFile(formData)
  }

  const uploadAvatarFile = async (formData: FormData) => {
    toast.loading(t('account.uploadingAvatar'), { id: 'avatar-upload' })

    try {
      await updateAvatar(formData).unwrap()
      toast.success(t('account.avatarUpdated'), { id: 'avatar-upload' })
    } catch (error) {
      toast.error(getErrorMessage(error, t('account.avatarError')), {
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

    return (
      <StyledAccount>
        <h2>
          <Trans
            i18nKey="account.hello"
            values={{ name: firstName }}
            components={{ name: <span /> }}
          />
        </h2>
        <UserDataFields>
          <Details>
            <h5>{t('account.information')}</h5>
            <div>
              <AvatarPanel>
                <Avatar
                  imgUrl={avatar ?? undefined}
                  onClick={handleAvatarClick}
                  title={t('account.changeAvatar')}
                  $size={160}
                  $hoverControls
                />
                <input
                  type="file"
                  name="avatarChangeInput"
                  aria-label={t('account.changeAvatar')}
                  onChange={handleAvatarChange}
                  disabled={userIsUpdating}
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
                  {t('auth.changePassword')}
                </Button>
                <PasswordDialog ref={passwordDialog} email={email} />
              </AvatarPanel>
              <General>
                <Formik
                  initialValues={{
                    firstName,
                    lastName,
                    phone: phone ?? '',
                  }}
                  enableReinitialize
                  validationSchema={accountBasicSchema}
                  onSubmit={handleUserInfoSubmit}
                  onReset={handleUserInfoReset}>
                  {({ dirty }) => (
                    <Form>
                      <GeneralLine>
                        <div>
                          <p>{t('common.fields.firstName')}</p>
                          <FormikField
                            name="firstName"
                            placeholder={t('common.fields.firstName')}
                            type="text"
                            autoComplete="given-name"
                            readOnly={!editingUserInfo}
                          />
                        </div>
                        <div>
                          <p>{t('common.fields.lastName')}</p>
                          <FormikField
                            name="lastName"
                            placeholder={t('common.fields.lastName')}
                            type="text"
                            autoComplete="family-name"
                            readOnly={!editingUserInfo}
                          />
                        </div>
                      </GeneralLine>
                      <GeneralLine>
                        <div>
                          <p>{t('common.fields.email')}</p>
                          <FormikField
                            value={email}
                            placeholder={t('common.fields.email')}
                            type="email"
                            autoComplete="email"
                            readOnly
                          />
                        </div>
                        <div>
                          <p>{t('common.fields.phone')}</p>
                          <FormikField
                            name="phone"
                            placeholder={t('common.fields.phone')}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            readOnly={!editingUserInfo}
                          />
                        </div>
                      </GeneralLine>
                      {editingUserInfo && (
                        <ButtonWrapper>
                          <Button type="reset" $size="sm" $color="neutral">
                            {t('common.actions.cancel')}
                          </Button>
                          <Button
                            $size="sm"
                            type="submit"
                            disabled={userIsUpdating || !dirty}>
                            {userIsUpdating && <SpinnerIcon height={22} />}
                            {t('common.actions.save')}
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
              title={t('account.editContact')}
              disabled={editingUserInfo}
            />
          </Details>
          <Details>
            <h5>{t('common.fields.address')}</h5>
            <Address>
              <Formik
                initialValues={{
                  line1: address?.line1 ?? '',
                  line2: address?.line2 ?? '',
                  city: address?.city ?? '',
                  state: address?.state ?? '',
                  postal_code: address?.postal_code ?? '',
                  country: address?.country ?? country,
                }}
                enableReinitialize
                validationSchema={addressSchema}
                onSubmit={handleAddressSubmit}
                onReset={handleAddressReset}>
                {({ dirty }) => (
                  <Form>
                    <AddressLine>
                      <div>
                        <p>{t('account.addressLine1')}</p>
                        <FormikField
                          name="line1"
                          placeholder={t('account.addressLine1')}
                          type="text"
                          autoComplete="address-line1"
                          readOnly={!editingAddress}
                        />
                      </div>
                      <div>
                        <p>{t('account.addressLine2')}</p>
                        <FormikField
                          name="line2"
                          placeholder={t('account.addressLine2')}
                          type="text"
                          autoComplete="address-line2"
                          readOnly={!editingAddress}
                        />
                      </div>
                    </AddressLine>
                    <AddressLine>
                      <div>
                        <p>{t('common.fields.city')}</p>
                        <FormikField
                          name="city"
                          placeholder={t('common.fields.city')}
                          type="text"
                          autoComplete="address-level2"
                          readOnly={!editingAddress}
                        />
                      </div>
                      <div>
                        <p>{t('common.fields.state')}</p>
                        <FormikField
                          name="state"
                          placeholder={t('common.fields.state')}
                          type="text"
                          autoComplete="address-level1"
                          readOnly={!editingAddress}
                        />
                      </div>
                      <div>
                        <p>{t('common.fields.postalCode')}</p>
                        <FormikField
                          name="postal_code"
                          placeholder={t('common.fields.postalCode')}
                          type="text"
                          autoComplete="postal-code"
                          readOnly={!editingAddress}
                        />
                      </div>
                    </AddressLine>
                    <AddressLine>
                      <div>
                        <p>{t('common.fields.country')}</p>
                        <CountrySelect readOnly={!editingAddress} />
                      </div>
                    </AddressLine>
                    {editingAddress && (
                      <ButtonWrapper>
                        <Button $size="sm" type="reset" $color="neutral">
                          {t('common.actions.cancel')}
                        </Button>
                        <Button
                          $size="sm"
                          type="submit"
                          disabled={userIsUpdating || !dirty}>
                          {userIsUpdating && <SpinnerIcon height={22} />}
                          {t('common.actions.save')}
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
              title={t('account.editAddress')}
              disabled={editingAddress}
            />
          </Details>
        </UserDataFields>
      </StyledAccount>
    )
  }
}
