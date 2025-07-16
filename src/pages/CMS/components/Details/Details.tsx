import { FC } from 'react'
import { useLocation } from 'react-router'
import { Form, Formik, FormikHelpers } from 'formik'
import { toast } from 'react-hot-toast'
import { FormButtons, FormRow, StyledDetails } from './Details.style'
import { Button, FormikField } from '@/components'
import { addAuthor, addBook } from '@/store'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Author, Book } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import { CMSContext } from '../../CMS.types'

const initialBookValues: Omit<Book, 'id'> = {
  title: '',
  authorId: 3,
  genre: '',
  imgUrl: '',
  description: '',
  publishYear: 2000,
  rating: 5,
  price: 0,
  discount: 0,
  discountPrice: 0,
  topSellers: false,
  newRelease: false,
}

type Props = { setIsDetailsOpen: (isOpen: boolean) => void }

export const Details: FC<Props> = ({ setIsDetailsOpen }) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { booksIsLoading } = useAppSelector((state) => state.cms)

  const activeTab = location.pathname.split('/').pop() as keyof CMSContext

  const actionMap = {
    books: {
      action: addBook,
      success: 'Book added successfully',
      error: 'Failed to add book',
    },
    authors: {
      action: addAuthor,
      success: 'Author added successfully',
      error: 'Failed to add author',
    },
  }

  const handleSubmit = async <T extends Omit<Book, 'id'> | Omit<Author, 'id'>>(
    values: T,
    actions: FormikHelpers<T>,
  ) => {
    const config = actionMap[activeTab as keyof typeof actionMap]
    if (!config) return

    //@ts-expect-error Redux thunk expects a specific type
    const result = await dispatch(config.action(values))

    if (result.meta.requestStatus === 'fulfilled') {
      actions.resetForm()
      toast.success(config.success)
    } else {
      toast.error(config.error)
    }
  }

  const renderButtons = () => (
    <FormButtons>
      <Button
        type="reset"
        onClick={() => setIsDetailsOpen(false)}
        $size="sm"
        $inverted>
        Cancel
      </Button>
      <Button type="submit" $size="sm">
        {booksIsLoading ? <SpinnerIcon height={22} /> : 'Save'}
      </Button>
    </FormButtons>
  )

  const renderForm = () => {
    if (activeTab === 'books') {
      return (
        <Formik initialValues={initialBookValues} onSubmit={handleSubmit}>
          <Form>
            <FormRow>
              <div>
                <p>Title</p>
                <FormikField name="title" placeholder="Title" type="text" />
              </div>
              <div>
                <p>Author</p>
                <FormikField name="authorId" placeholder="Author" type="text" />
              </div>
              <div>
                <p>Publish Year</p>
                <FormikField
                  name="publishYear"
                  placeholder="Publish Year"
                  type="number"
                />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <p>Genre</p>
                <FormikField name="genre" placeholder="Genre" type="text" />
              </div>
              <div>
                <p>Description</p>
                <FormikField
                  name="description"
                  placeholder="Description"
                  type="text"
                />
              </div>
              <div>
                <p>Image URL</p>
                <FormikField
                  name="imgUrl"
                  placeholder="Image URL"
                  type="text"
                />
              </div>
            </FormRow>
            {renderButtons()}
          </Form>
        </Formik>
      )
    }
  }

  return <StyledDetails>{renderForm()}</StyledDetails>
}
