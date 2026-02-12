import { FC } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik, FormikHelpers } from 'formik'
import { addAuthor, updateAuthor } from '@/store'
import { Button, FormikField } from '@/components'
import { useAppDispatch } from '@/hooks'
import { formatDate } from '@/helpers'
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
}

export const AuthorEditForm: FC<Props> = ({ editedItem, onClose }) => {
  const dispatch = useAppDispatch()

  const handleSubmit = async (
    values: Author,
    actions: FormikHelpers<Author>,
  ) => {
    try {
      let result
      if (editedItem) {
        const { createdAt, updatedAt, ...authorValues } = values
        result = await dispatch(updateAuthor(authorValues))
      } else {
        const { id, ...authorWithoutId } = values
        result = await dispatch(addAuthor(authorWithoutId))
      }

      if (result?.meta?.requestStatus === 'fulfilled') {
        actions.resetForm()
        toast.success(`Author ${editedItem ? 'updated' : 'added'} successfully`)
        onClose()
      } else {
        toast.error(`Failed to ${editedItem ? 'update' : 'add'} author`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
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
              <FormikField name="homeland" placeholder="Homeland" type="text" />
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
          <FormButtons>
            <Button
              type="reset"
              onClick={onClose}
              $size="sm"
              $inverted
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" $size="sm" disabled={!dirty || isSubmitting}>
              {isSubmitting ? <SpinnerIcon height={22} /> : 'Save'}
            </Button>
          </FormButtons>
        </Form>
      )}
    </Formik>
  )
}
