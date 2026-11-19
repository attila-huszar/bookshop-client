import { FC, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Formik, FormikHelpers } from 'formik'
import { useAddUserMutation, useUpdateUserMutation } from '@/store/api/usersApi'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { CountrySelect } from '@/components/CountrySelect'
import { FormikField } from '@/components/FormikField'
import { getErrorMessage } from '@/helpers/errors'
import { formatDate } from '@/helpers/formatDate'
import { userCreateSchema, userSchema } from '@/validation/userSchemas'
import { type CmsUser, type CmsUserCreate, UserRole } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import {
  AddressBlock,
  FormButtons,
  FullRow,
  MetadataBlock,
  Row,
  SectionHeader,
  SignInMethods,
  UserRoleRow,
} from '../../styles'

const initialUserValues: CmsUserCreate = {
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
  password: '',
}

type Props = {
  editedItem: CmsUser | null
  onClose: () => void
  readOnly?: boolean
}

export const UserEditForm: FC<Props> = ({ editedItem, onClose, readOnly }) => {
  const { t, i18n } = useTranslation()
  const verifiedId = useId()

  const [addUser] = useAddUserMutation()
  const [updateUser] = useUpdateUserMutation()

  const initialValues: CmsUserCreate = editedItem
    ? {
        email: editedItem.email,
        firstName: editedItem.firstName,
        lastName: editedItem.lastName,
        country: editedItem.country,
        phone: editedItem.phone,
        address: editedItem.address,
        avatar: editedItem.avatar,
        role: editedItem.role,
        verified: editedItem.verified,
        password: '',
      }
    : initialUserValues

  const handleSubmit = async (
    values: CmsUserCreate,
    actions: FormikHelpers<CmsUserCreate>,
  ) => {
    try {
      if (editedItem) {
        const { password, ...userValues } = values

        await updateUser({ ...userValues, uuid: editedItem.uuid }).unwrap()
      } else {
        await addUser(values).unwrap()
      }

      actions.resetForm()
      toast.success(i18n.t('cms.saved', { entity: i18n.t('cms.user') }))
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Formik
      key="users"
      initialValues={initialValues}
      validationSchema={editedItem ? userSchema : userCreateSchema}
      onSubmit={handleSubmit}>
      {({ dirty, isSubmitting }) => (
        <Form>
          <fieldset disabled={readOnly}>
            {editedItem && (
              <>
                <MetadataBlock>
                  <div>
                    <p>{t('cms.recordId', { entity: t('cms.user') })}</p>
                    <span>{editedItem.id}</span>
                  </div>
                  <div>
                    <p>{t('common.fields.createdAt')}</p>
                    <span>
                      {editedItem.createdAt
                        ? formatDate(editedItem.createdAt)
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <p>{t('common.fields.updatedAt')}</p>
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
                <FormikField
                  label={t('common.fields.firstName')}
                  name="firstName"
                  placeholder={t('common.fields.firstName')}
                  type="text"
                />
              </div>
              <div>
                <FormikField
                  label={t('common.fields.lastName')}
                  name="lastName"
                  placeholder={t('common.fields.lastName')}
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <FormikField
                  label={t('common.fields.email')}
                  name="email"
                  placeholder={t('common.fields.email')}
                  type="email"
                />
              </div>
              <div>
                <FormikField
                  label={t('common.fields.phone')}
                  name="phone"
                  placeholder={t('common.fields.phone')}
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <CountrySelect
                  label={t('cms.countryRegistration')}
                  fieldName="country"
                  readOnly={readOnly}
                />
              </div>
              <div>
                <FormikField
                  label={t('common.fields.avatarUrl')}
                  name="avatar"
                  placeholder={t('common.fields.avatarUrl')}
                  type="text"
                />
              </div>
            </Row>
            {!editedItem && (
              <FullRow>
                <div>
                  <FormikField
                    label={t('common.fields.password')}
                    name="password"
                    placeholder={t('common.fields.password')}
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
              </FullRow>
            )}
            <UserRoleRow>
              <div>
                <FormikField
                  label={t('common.fields.role')}
                  name="role"
                  type="select">
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {t(`cms.roles.${role}`)}
                    </option>
                  ))}
                </FormikField>
              </div>
              {editedItem && (
                <div className="sign-in-methods">
                  <p>{t('cms.signInMethodsLabel')}</p>
                  <SignInMethods aria-label={t('cms.signInMethodsLabel')}>
                    {editedItem.signInMethods
                      .map((method) => t(`cms.signInMethods.${method}`))
                      .join(', ') || '—'}
                  </SignInMethods>
                </div>
              )}
              <div className="centered-checkbox">
                <p>
                  <label htmlFor={verifiedId}>
                    {t('common.fields.verified')}
                  </label>
                </p>
                <div style={{ display: 'flex', height: '100%' }}>
                  <FormikField
                    id={verifiedId}
                    name="verified"
                    type="checkbox"
                  />
                </div>
              </div>
            </UserRoleRow>
            <AddressBlock>
              <p>{t('common.fields.address')}</p>
              <Row>
                <div>
                  <FormikField
                    label={t('common.fields.line1')}
                    name="address.line1"
                    placeholder={t('common.fields.line1')}
                    type="text"
                  />
                </div>
                <div>
                  <FormikField
                    label={t('common.fields.line2')}
                    name="address.line2"
                    placeholder={t('common.fields.line2')}
                    type="text"
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <FormikField
                    label={t('common.fields.city')}
                    name="address.city"
                    placeholder={t('common.fields.city')}
                    type="text"
                  />
                </div>
                <div>
                  <FormikField
                    label={t('common.fields.state')}
                    name="address.state"
                    placeholder={t('common.fields.state')}
                    type="text"
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <FormikField
                    label={t('common.fields.postalCode')}
                    name="address.postal_code"
                    placeholder={t('common.fields.postalCode')}
                    type="text"
                  />
                </div>
                <div>
                  <CountrySelect
                    fieldName="address.country"
                    readOnly={readOnly}
                  />
                </div>
              </Row>
            </AddressBlock>
            {editedItem && (
              <>
                <SectionHeader>{t('cms.metadata')}</SectionHeader>
                <MetadataBlock>
                  <div>
                    <p>{t('common.fields.uuid')}</p>
                    <span>{editedItem.uuid}</span>
                  </div>
                </MetadataBlock>
              </>
            )}
          </fieldset>
          <FormButtons>
            <Button
              type={readOnly ? 'button' : 'reset'}
              onClick={onClose}
              $size="sm"
              $color="neutral"
              disabled={isSubmitting}>
              {readOnly
                ? t('common.actions.close')
                : t('common.actions.cancel')}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                $size="sm"
                disabled={!dirty || isSubmitting}>
                {isSubmitting && <SpinnerIcon height={22} />}
                {t('common.actions.save')}
              </Button>
            )}
          </FormButtons>
        </Form>
      )}
    </Formik>
  )
}
