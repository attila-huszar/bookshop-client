import { Form, Formik } from 'formik'
import { FormButtons, FormRow, StyledDetails } from './Details.style'
import { Button, FormikField } from '@/components'
import { useAppDispatch } from '@/hooks'
import { Book } from '@/types'
import { postBook } from '@/store'

const initialValues: Omit<Book, 'id'> = {
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

export const Details = () => {
  const dispatch = useAppDispatch()

  const handleSubmit = (values: Omit<Book, 'id'>) => {
    void dispatch(postBook(values))
  }

  return (
    <StyledDetails>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
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
              <FormikField name="imgUrl" placeholder="Image URL" type="text" />
            </div>
          </FormRow>
          <FormButtons>
            <Button type="reset" $size="sm" $inverted>
              Cancel
            </Button>
            <Button type="submit" $size="sm">
              Save
            </Button>
          </FormButtons>
        </Form>
      </Formik>
    </StyledDetails>
  )
}
