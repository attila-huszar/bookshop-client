import { FC } from 'react'
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
  const { t } = useTranslation()

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
      toast.success(t('cms.saved', { entity: t('cms.user') }))
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error, t('common.unexpectedError')))
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
                <SectionHeader>
                  {t('cms.information', { entity: t('cms.user') })}
                </SectionHeader>
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
                <p>{t('common.fields.firstName')}</p>
                <FormikField
                  name="firstName"
                  placeholder={t('common.fields.firstName')}
                  type="text"
                />
              </div>
              <div>
                <p>{t('common.fields.lastName')}</p>
                <FormikField
                  name="lastName"
                  placeholder={t('common.fields.lastName')}
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <p>{t('common.fields.email')}</p>
                <FormikField
                  name="email"
                  placeholder={t('common.fields.email')}
                  type="email"
                />
              </div>
              <div>
                <p>{t('common.fields.phone')}</p>
                <FormikField
                  name="phone"
                  placeholder={t('common.fields.phone')}
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <p>{t('cms.countryRegistration')}</p>
                <CountrySelect fieldName="country" readOnly={readOnly} />
              </div>
              <div>
                <p>{t('common.fields.avatarUrl')}</p>
                <FormikField
                  name="avatar"
                  placeholder={t('common.fields.avatarUrl')}
                  type="text"
                />
              </div>
            </Row>
            {!editedItem && (
              <FullRow>
                <div>
                  <p>{t('common.fields.password')}</p>
                  <FormikField
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
                <p>{t('common.fields.role')}</p>
                <FormikField name="role" type="select">
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {t(`cms.roles.${role}`)}
                    </option>
                  ))}
                </FormikField>
              </div>
              <div className="centered-checkbox">
                <p>{t('common.fields.verified')}</p>
                <div style={{ display: 'flex', height: '100%' }}>
                  <FormikField name="verified" type="checkbox" />
                </div>
              </div>
            </UserRoleRow>
            <AddressBlock>
              <p>{t('common.fields.address')}</p>
              <Row>
                <div>
                  <p>{t('common.fields.line1')}</p>
                  <FormikField
                    name="address.line1"
                    placeholder={t('common.fields.line1')}
                    type="text"
                  />
                </div>
                <div>
                  <p>{t('common.fields.line2')}</p>
                  <FormikField
                    name="address.line2"
                    placeholder={t('common.fields.line2')}
                    type="text"
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <p>{t('common.fields.city')}</p>
                  <FormikField
                    name="address.city"
                    placeholder={t('common.fields.city')}
                    type="text"
                  />
                </div>
                <div>
                  <p>{t('common.fields.state')}</p>
                  <FormikField
                    name="address.state"
                    placeholder={t('common.fields.state')}
                    type="text"
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <p>{t('common.fields.postalCode')}</p>
                  <FormikField
                    name="address.postal_code"
                    placeholder={t('common.fields.postalCode')}
                    type="text"
                  />
                </div>
                <div>
                  <p>{t('common.fields.country')}</p>
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
