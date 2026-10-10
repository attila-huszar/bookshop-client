import { FC } from 'react'
import { Form, Formik, FormikHelpers } from 'formik'
import {
  useAddAuthorMutation,
  useUpdateAuthorMutation,
} from '@/store/api/bookshopApi'
import { Button, FormikField, toast } from '@/components'
import { formatDate, getErrorMessage } from '@/helpers'
import { authorSchema } from '@/validation'
import { Author } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import {
  FormButtons,
  FullRow,
  MetadataBlock,
  Row,
  SectionHeader,
} from '../../styles'

const initialAuthorValues: Author = {
  id: 0,
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
  const [addAuthor] = useAddAuthorMutation()
  const [updateAuthor] = useUpdateAuthorMutation()

  const handleSubmit = async (
    values: Author,
    actions: FormikHelpers<Author>,
  ) => {
    try {
      if (editedItem) {
        const { createdAt, updatedAt, ...authorValues } = values
        await updateAuthor(authorValues).unwrap()
      } else {
        const { id, ...authorWithoutId } = values
        await addAuthor(authorWithoutId).unwrap()
      }

      actions.resetForm()
      toast.success(`Author ${editedItem ? 'updated' : 'added'} successfully`)
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error, 'An unexpected error occurred'))
    }
  }

  return (
    <Formik
      key="authors"
      initialValues={editedItem ?? initialAuthorValues}
      validationSchema={authorSchema}
      onSubmit={handleSubmit}>
      {({ dirty, isSubmitting }) => (
        <Form>
          <fieldset disabled={readOnly}>
            {editedItem && (
              <>
                <SectionHeader>Author Information</SectionHeader>
                <MetadataBlock>
                  <div>
                    <p>Author ID</p>
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
            <Row>
              <div>
                <p>Name</p>
                <FormikField name="name" placeholder="Name" type="text" />
              </div>
              <div>
                <p>Full Name</p>
                <FormikField
                  name="fullName"
                  placeholder="Full Name"
                  type="text"
                />
              </div>
              <div>
                <p>Homeland</p>
                <FormikField
                  name="homeland"
                  placeholder="Homeland"
                  type="text"
                />
              </div>
            </Row>
            <Row>
              <div>
                <p>Birth</p>
                <FormikField name="birthYear" placeholder="Birth" type="text" />
              </div>
              <div>
                <p>Death</p>
                <FormikField name="deathYear" placeholder="Death" type="text" />
              </div>
            </Row>
            <FullRow>
              <div>
                <p>Biography</p>
                <FormikField
                  name="biography"
                  placeholder="Biography"
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
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                $size="sm"
                disabled={!dirty || isSubmitting}>
                {isSubmitting && <SpinnerIcon height={22} />} Save
              </Button>
            )}
          </FormButtons>
        </Form>
      )}
    </Formik>
  )
}
