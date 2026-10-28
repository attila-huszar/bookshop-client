import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Formik, FormikHelpers } from 'formik'
import {
  useAddAuthorMutation,
  useUpdateAuthorMutation,
} from '@/store/api/authorsApi'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { FormikField } from '@/components/FormikField'
import { getErrorMessage } from '@/helpers/errors'
import { formatDate } from '@/helpers/formatDate'
import { authorSchema } from '@/validation/productSchemas'
import type { Author, AuthorCreate } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import {
  FormButtons,
  FullRow,
  MetadataBlock,
  Row,
  SectionHeader,
} from '../../styles'

const initialAuthorValues: AuthorCreate = {
  name: '',
  fullName: '',
  birthYear: '',
  deathYear: '',
  homeland: '',
  biography: '',
}

type Props = {
  editedItem: Author | null
  onClose: () => void
  readOnly?: boolean
}

export const AuthorEditForm: FC<Props> = ({
  editedItem,
  onClose,
  readOnly,
}) => {
  const { t } = useTranslation()

  const [addAuthor] = useAddAuthorMutation()
  const [updateAuthor] = useUpdateAuthorMutation()

  const initialValues: AuthorCreate = editedItem
    ? {
        name: editedItem.name,
        fullName: editedItem.fullName,
        birthYear: editedItem.birthYear,
        deathYear: editedItem.deathYear,
        homeland: editedItem.homeland,
        biography: editedItem.biography,
      }
    : initialAuthorValues

  const handleSubmit = async (
    values: AuthorCreate,
    actions: FormikHelpers<AuthorCreate>,
  ) => {
    try {
      if (editedItem) {
        await updateAuthor({ ...values, id: editedItem.id }).unwrap()
      } else {
        await addAuthor(values).unwrap()
      }

      actions.resetForm()
      toast.success(t('cms.saved', { entity: t('common.fields.author') }))
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error, t('common.unexpectedError')))
    }
  }

  return (
    <Formik
      key="authors"
      initialValues={initialValues}
      validationSchema={authorSchema}
      onSubmit={handleSubmit}>
      {({ dirty, isSubmitting }) => (
        <Form>
          <fieldset disabled={readOnly}>
            {editedItem && (
              <>
                <SectionHeader>
                  {t('cms.information', { entity: t('common.fields.author') })}
                </SectionHeader>
                <MetadataBlock>
                  <div>
                    <p>
                      {t('cms.recordId', { entity: t('common.fields.author') })}
                    </p>
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
                <p>{t('common.fields.name')}</p>
                <FormikField
                  name="name"
                  placeholder={t('common.fields.name')}
                  type="text"
                />
              </div>
              <div>
                <p>{t('common.fields.fullName')}</p>
                <FormikField
                  name="fullName"
                  placeholder={t('common.fields.fullName')}
                  type="text"
                />
              </div>
              <div>
                <p>{t('common.fields.homeland')}</p>
                <FormikField
                  name="homeland"
                  placeholder={t('common.fields.homeland')}
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <p>{t('common.fields.birth')}</p>
                <FormikField
                  name="birthYear"
                  placeholder={t('common.fields.birth')}
                  type="text"
                />
              </div>
              <div>
                <p>{t('common.fields.death')}</p>
                <FormikField
                  name="deathYear"
                  placeholder={t('common.fields.death')}
                  type="text"
                />
              </div>
            </Row>
            <FullRow>
              <div>
                <p>{t('common.fields.biography')}</p>
                <FormikField
                  name="biography"
                  placeholder={t('common.fields.biography')}
                  type="textarea"
                  rows={4}
                />
              </div>
            </FullRow>
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
