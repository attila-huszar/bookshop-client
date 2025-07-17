import { FC } from 'react'
import { useLocation } from 'react-router'
import { Form, Formik, FormikHelpers, FormikState } from 'formik'
import { toast } from 'react-hot-toast'
import {
  FormButtons,
  TitleRow,
  DefaultRow,
  StyledDetails,
  CheckboxRow,
} from './Details.style'
import { Button, FormikField } from '@/components'
import { addAuthor, addBook } from '@/store'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { AuthorFormValues, BookFormValues } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import { initialAuthorValues, initialBookValues } from './initialValues'
import { CMSContext } from '../../CMS.types'

type Props = { setIsDetailsOpen: (isOpen: boolean) => void }

export const Details: FC<Props> = ({ setIsDetailsOpen }) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { authors } = useAppSelector((state) => state.cms)
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

  const handleSubmit = async <T extends BookFormValues | AuthorFormValues>(
    values: T,
    actions: FormikHelpers<T>,
  ) => {
    const config = actionMap[activeTab as keyof typeof actionMap]
    if (!config) return

    let submitValues = values

    if ('authorId' in values) {
      submitValues = {
        ...values,
        authorId: Number(values.authorId),
      }
    }

    //@ts-expect-error Redux thunk expects a specific type
    const result = await dispatch(config.action(submitValues))

    if (result.meta.requestStatus === 'fulfilled') {
      actions.resetForm()
      toast.success(config.success)
    } else {
      toast.error(config.error)
    }
  }

  const renderButtons = ({ isSubmitting }: Partial<FormikState<unknown>>) => (
    <FormButtons>
      <Button
        type="reset"
        onClick={() => setIsDetailsOpen(false)}
        $size="sm"
        $inverted>
        Cancel
      </Button>
      <Button type="submit" $size="sm">
        {isSubmitting ? <SpinnerIcon height={22} /> : 'Save'}
      </Button>
    </FormButtons>
  )

  const renderForm = () => {
    switch (activeTab) {
      case 'books':
        return (
          <Formik
            key={activeTab}
            initialValues={initialBookValues}
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <TitleRow>
                  <div>
                    <p>Title</p>
                    <FormikField name="title" placeholder="Title" type="text" />
                  </div>
                  <div>
                    <p>Author</p>
                    <FormikField name="authorId" type="select">
                      <option value="" hidden>
                        Please select an author...
                      </option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </FormikField>
                  </div>
                  <div>
                    <p>Published</p>
                    <FormikField
                      name="publishYear"
                      placeholder="Published"
                      type="number"
                    />
                  </div>
                </TitleRow>
                <DefaultRow>
                  <div>
                    <p>Description</p>
                    <FormikField
                      name="description"
                      placeholder="Description"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Genre</p>
                    <FormikField name="genre" placeholder="Genre" type="text" />
                  </div>
                  <div>
                    <p>Image URL</p>
                    <FormikField
                      name="imgUrl"
                      placeholder="Image URL"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Price</p>
                    <FormikField
                      name="price"
                      placeholder="Price"
                      type="number"
                    />
                  </div>
                  <div>
                    <p>Discount</p>
                    <FormikField
                      name="discount"
                      placeholder="Discount"
                      type="number"
                    />
                  </div>
                  <div>
                    <p>Discount Price</p>
                    <FormikField
                      name="discountPrice"
                      placeholder="Discount Price"
                      type="number"
                    />
                  </div>
                </DefaultRow>
                <CheckboxRow>
                  <div>
                    <p>Rating</p>
                    <FormikField
                      name="rating"
                      placeholder="Rating"
                      type="number"
                    />
                  </div>
                  <p>Top Sellers</p>
                  <FormikField name="topSellers" type="checkbox" />
                  <p>New Release</p>
                  <FormikField name="newRelease" type="checkbox" />
                </CheckboxRow>
                {renderButtons({ isSubmitting })}
              </Form>
            )}
          </Formik>
        )
      case 'authors':
        return (
          <Formik
            key={activeTab}
            initialValues={initialAuthorValues}
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <DefaultRow>
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
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Birth</p>
                    <FormikField name="birth" placeholder="Birth" type="text" />
                  </div>
                  <div>
                    <p>Death</p>
                    <FormikField name="death" placeholder="Death" type="text" />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Biography</p>
                    <FormikField
                      name="biography"
                      placeholder="Biography"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                {renderButtons({ isSubmitting })}
              </Form>
            )}
          </Formik>
        )
      case 'users':
      case 'orders':
        return (
          <div>
            <p>WIP</p>
          </div>
        )
    }
  }

  return <StyledDetails>{renderForm()}</StyledDetails>
}
