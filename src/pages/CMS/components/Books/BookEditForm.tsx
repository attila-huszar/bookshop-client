import { ChangeEvent, FC, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik, FormikHelpers } from 'formik'
import { uploadProductImage } from '@/api'
import { addBook, updateBook } from '@/store'
import { Button, FormikField, IconButton } from '@/components'
import { useAppDispatch, useAppSelector, useDebounce } from '@/hooks'
import { log } from '@/services/logger'
import { formatDate } from '@/helpers'
import { bookSchema, validateImageFile } from '@/validation'
import { BookWithAuthorId } from '@/types'
import { SpinnerIcon, UploadIcon } from '@/assets/svg'
import {
  BookGenreRow,
  BookSettingsRow,
  BookTitleRow,
  FormButtons,
  FullRow,
  MetadataBlock,
  Row,
  SectionHeader,
} from '../../styles'

const initialBookValues: BookWithAuthorId = {
  id: 0,
  title: '',
  authorId: 0,
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

type Props = {
  editedItem: BookWithAuthorId | null
  onClose: () => void
}

export const BookEditForm: FC<Props> = ({ editedItem, onClose }) => {
  const dispatch = useAppDispatch()
  const { authors } = useAppSelector((state) => state.cms)
  const [showBookCover, setShowBookCover] = useState<boolean>(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const productImageInputRef = useRef<HTMLInputElement>(null)

  const handleMouseMove = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    const target = e.target as HTMLInputElement
    const rect = target.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: rect.height,
    })
  }

  const debouncedMouseMove = useDebounce(handleMouseMove, 10)

  const handleProductImageClick = () => {
    productImageInputRef.current?.click()
  }

  const handleProductImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target
    const files = fileInput.files

    if (!files || files.length === 0) return

    const file = files[0]!
    const { valid, error } = validateImageFile(file)

    if (!valid && error) {
      toast.error(error, { id: 'product-image-upload-error' })
      fileInput.value = ''
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    toast.loading('Uploading image...', { id: 'product-image-upload' })

    try {
      const result = await uploadProductImage(formData)

      toast.success('Image uploaded successfully', {
        id: 'product-image-upload',
      })
      return result.url
    } catch (error) {
      log.error('Image upload failed:', { error })

      toast.error('Failed to upload image, please try again later', {
        id: 'product-image-upload',
      })
      throw error
    } finally {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (
    values: BookWithAuthorId,
    actions: FormikHelpers<BookWithAuthorId>,
  ) => {
    try {
      let result
      if (editedItem) {
        const { createdAt, updatedAt, ...bookValues } = values
        result = await dispatch(updateBook(bookValues))
      } else {
        const { id, ...bookWithoutId } = values
        result = await dispatch(addBook(bookWithoutId))
      }

      if (result?.meta?.requestStatus === 'fulfilled') {
        actions.resetForm()
        toast.success(`Book ${editedItem ? 'updated' : 'added'} successfully`)
        onClose()
      } else {
        toast.error(`Failed to ${editedItem ? 'update' : 'add'} book`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    }
  }

  return (
    <Formik
      key="books"
      initialValues={editedItem ?? initialBookValues}
      validationSchema={bookSchema}
      onSubmit={handleSubmit}>
      {({ values, dirty, isSubmitting, setFieldValue }) => (
        <Form>
          {editedItem && (
            <>
              <SectionHeader>Book Information</SectionHeader>
              <MetadataBlock>
                <div>
                  <p>Book ID</p>
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
          <BookTitleRow>
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
          </BookTitleRow>
          <FullRow>
            <div>
              <p>Description</p>
              <FormikField
                name="description"
                placeholder="Description"
                type="textarea"
                rows={4}
              />
            </div>
          </FullRow>
          <BookGenreRow>
            <div>
              <p>Genre</p>
              <FormikField name="genre" placeholder="Genre" type="text" />
            </div>
            <div>
              <p>Rating</p>
              <FormikField name="rating" placeholder="Rating" type="number" />
            </div>
          </BookGenreRow>
          <Row>
            <div>
              <p>Price</p>
              <FormikField name="price" placeholder="Price" type="number" />
            </div>
            <div>
              <p>Discount %</p>
              <FormikField
                name="discount"
                placeholder="Discount"
                type="number"
              />
            </div>
            <div>
              <p>Discount Price</p>
              {(() => {
                const price = Number(values.price) || 0
                const discount = Number(values.discount) || 0
                const discountPrice = (price * (1 - discount / 100)).toFixed(2)

                return (
                  <FormikField
                    value={discountPrice}
                    readOnly
                    name="discountPrice"
                    placeholder="Discount Price"
                    type="number"
                  />
                )
              })()}
            </div>
          </Row>
          <BookSettingsRow>
            <div style={{ position: 'relative' }}>
              <p>Image URL</p>
              <FormikField
                name="imgUrl"
                placeholder="Image URL"
                type="text"
                onMouseEnter={() => setShowBookCover(true)}
                onMouseMove={debouncedMouseMove}
                onMouseLeave={() => setShowBookCover(false)}
              />
              {showBookCover && (
                <img
                  src={values.imgUrl}
                  style={{
                    display: 'block',
                    position: 'absolute',
                    top: mousePos.y - 160,
                    left: mousePos.x + 8,
                    maxHeight: '10rem',
                    boxShadow: 'var(--shadow)',
                    borderRadius: 6,
                    zIndex: 1000,
                    pointerEvents: 'none',
                  }}
                  alt="Book cover preview"
                />
              )}
            </div>
            <div>
              <IconButton
                type="button"
                onClick={handleProductImageClick}
                title="Upload Image"
                icon={<UploadIcon />}
                $iconSize="lg"
              />
              <input
                type="file"
                name="productImageInput"
                aria-label="Upload Product Image"
                onChange={(e) => {
                  handleProductImageChange(e)
                    .then((url) => setFieldValue('imgUrl', url))
                    .catch(() => setFieldValue('imgUrl', ''))
                }}
                accept="image/*"
                ref={productImageInputRef}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <p>Top Sellers</p>
              <FormikField name="topSellers" type="checkbox" />
            </div>
            <div>
              <p>New Release</p>
              <FormikField name="newRelease" type="checkbox" />
            </div>
          </BookSettingsRow>
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
