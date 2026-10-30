import { ChangeEvent, FC, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Formik, FormikHelpers } from 'formik'
import { uploadProductImage } from '@/api/cms'
import { useCmsAuthorsQuery } from '@/store/api/authorsApi'
import { useAddBookMutation, useUpdateBookMutation } from '@/store/api/booksApi'
import { Alert } from '@/components/Alert'
import { toast } from '@/components/AppToaster'
import { Button, IconButton } from '@/components/Button'
import { FormikField } from '@/components/FormikField'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { getErrorMessage } from '@/helpers/errors'
import { formatDate } from '@/helpers/formatDate'
import { calculatePriceCents } from '@/helpers/pricing'
import { IMAGE_ACCEPT, validateImageFile } from '@/validation/fileSchemas'
import { bookSchema } from '@/validation/productSchemas'
import type { BookCreate, BookWithAuthorId } from '@/types'
import { SpinnerIcon, UploadIcon } from '@/assets/svg'
import {
  BookGenreRow,
  BookSettingsRow,
  BookTitleRow,
  FormButtons,
  FullRow,
  MetadataBlock,
  Row,
} from '../../styles'

type NumericBookField = 'publishYear' | 'rating' | 'price' | 'discount'
type BookFormValues = Omit<
  BookCreate,
  'discountPrice' | 'authorId' | NumericBookField
> &
  Record<NumericBookField, number | ''> & { authorId: number | string }

const initialBookValues: BookFormValues = {
  title: '',
  authorId: 0,
  genre: '',
  imgUrl: '',
  description: '',
  publishYear: 2000,
  rating: 5,
  price: 0,
  discount: 0,
  topSellers: false,
  newRelease: false,
}

type Props = {
  editedItem: BookWithAuthorId | null
  onClose: () => void
  readOnly?: boolean
}

export const BookEditForm: FC<Props> = ({
  editedItem,
  onClose,
  readOnly = false,
}) => {
  const { t } = useTranslation()

  const [addBook] = useAddBookMutation()
  const [updateBook] = useUpdateBookMutation()
  const {
    data: authors = [],
    isLoading: authorsLoading,
    error: authorsError,
  } = useCmsAuthorsQuery()
  const [showBookCover, setShowBookCover] = useState<boolean>(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const uploadInFlight = useRef(false)
  const mounted = useRef(false)
  const uploadToastId = useId()

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  const initialValues: BookFormValues = editedItem
    ? {
        title: editedItem.title,
        authorId: editedItem.authorId,
        genre: editedItem.genre,
        imgUrl: editedItem.imgUrl,
        description: editedItem.description,
        publishYear: editedItem.publishYear,
        rating: editedItem.rating,
        price: editedItem.price,
        discount: editedItem.discount,
        topSellers: editedItem.topSellers,
        newRelease: editedItem.newRelease,
      }
    : initialBookValues

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

  const debouncedMouseMove = useDebouncedCallback(handleMouseMove, 10)

  const handleProductImageClick = () => {
    productImageInputRef.current?.click()
  }

  const handleProductImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<BookFormValues>['setFieldValue'],
  ) => {
    const fileInput = e.target
    const files = fileInput.files

    const file = files?.[0]
    fileInput.value = ''

    if (!file || uploadInFlight.current || readOnly) {
      return
    }

    const { valid, error } = validateImageFile(file)

    if (!valid) {
      toast.error(error ?? t('cms.imageError'), {
        id: `${uploadToastId}-error`,
      })

      return
    }

    const formData = new FormData()

    formData.append('image', file)

    uploadInFlight.current = true
    setIsUploading(true)
    toast.loading(t('cms.uploadingImage'), { id: uploadToastId })

    try {
      const result = await uploadProductImage(formData)

      if (!mounted.current) {
        toast.dismiss(uploadToastId)

        return
      }

      await setFieldValue('imgUrl', result.url)
      toast.success(t('cms.imageUploaded'), {
        id: uploadToastId,
      })
    } catch (error) {
      toast.error(getErrorMessage(error, t('cms.imageError')), {
        id: uploadToastId,
      })
    } finally {
      uploadInFlight.current = false

      if (mounted.current) {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async (
    values: BookFormValues,
    actions: FormikHelpers<BookFormValues>,
  ) => {
    if (uploadInFlight.current) {
      return
    }

    try {
      const price = Number(values.price)
      const discount = Number(values.discount)
      const bookValues: BookCreate = {
        ...values,
        authorId: Number(values.authorId),
        publishYear: Number(values.publishYear),
        rating: Number(values.rating),
        price,
        discount,
        discountPrice: calculatePriceCents(price, discount) / 100,
      }

      if (editedItem) {
        await updateBook({ ...bookValues, id: editedItem.id }).unwrap()
      } else {
        await addBook(bookValues).unwrap()
      }

      actions.resetForm()
      toast.success(t('cms.saved', { entity: t('catalogue.book') }))
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error, t('common.unexpectedError')))
    }
  }

  if (authorsError && !authors.length) {
    return <Alert message={t('cms.authorsError')} error={authorsError} />
  }

  return (
    <Formik
      key="books"
      initialValues={initialValues}
      validationSchema={bookSchema}
      onSubmit={handleSubmit}>
      {({ values, dirty, isSubmitting, setFieldValue }) => (
        <Form
          aria-label={t('cms.information', { entity: t('catalogue.book') })}>
          <fieldset disabled={readOnly || isUploading || isSubmitting}>
            {editedItem && (
              <>
                <MetadataBlock>
                  <div>
                    <p>{t('cms.recordId', { entity: t('catalogue.book') })}</p>
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
            <BookTitleRow>
              <div>
                <p>{t('common.fields.title')}</p>
                <FormikField
                  name="title"
                  placeholder={t('common.fields.title')}
                  type="text"
                />
              </div>
              <div>
                <p>{t('common.fields.author')}</p>
                <FormikField
                  name="authorId"
                  type="select"
                  disabled={authorsLoading}
                  aria-busy={authorsLoading}>
                  <option value={0} hidden>
                    {t('cms.selectAuthor')}
                  </option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </FormikField>
              </div>
              <div>
                <p>{t('common.fields.published')}</p>
                <FormikField
                  name="publishYear"
                  placeholder={t('common.fields.published')}
                  type="number"
                />
              </div>
            </BookTitleRow>
            <FullRow>
              <div>
                <p>{t('common.fields.description')}</p>
                <FormikField
                  name="description"
                  placeholder={t('common.fields.description')}
                  type="textarea"
                  rows={4}
                />
              </div>
            </FullRow>
            <BookGenreRow>
              <div>
                <p>{t('common.fields.genre')}</p>
                <FormikField
                  name="genre"
                  placeholder={t('common.fields.genre')}
                  type="text"
                />
              </div>
              <div>
                <p>{t('common.fields.rating')}</p>
                <FormikField
                  name="rating"
                  placeholder={t('common.fields.rating')}
                  type="number"
                />
              </div>
            </BookGenreRow>
            <Row>
              <div>
                <p>{t('common.fields.price')}</p>
                <FormikField
                  name="price"
                  placeholder={t('common.fields.price')}
                  type="number"
                />
              </div>
              <div>
                <p>{t('common.fields.discountPercent')}</p>
                <FormikField
                  name="discount"
                  placeholder={t('common.fields.discount')}
                  type="number"
                />
              </div>
              <div>
                <p>{t('common.fields.discountPrice')}</p>
                <FormikField
                  value={(
                    calculatePriceCents(
                      Number(values.price) || 0,
                      Number(values.discount) || 0,
                    ) / 100
                  ).toFixed(2)}
                  readOnly
                  aria-label={t('common.fields.discountPrice')}
                  placeholder={t('common.fields.discountPrice')}
                  type="number"
                />
              </div>
            </Row>
            <BookSettingsRow>
              <div style={{ position: 'relative' }}>
                <p>{t('common.fields.imageUrl')}</p>
                <FormikField
                  name="imgUrl"
                  placeholder={t('common.fields.imageUrl')}
                  type="text"
                  onMouseEnter={() => setShowBookCover(true)}
                  onMouseMove={debouncedMouseMove}
                  onMouseLeave={() => setShowBookCover(false)}
                />
                {showBookCover && values.imgUrl && (
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
                    alt={t('cms.bookCover')}
                  />
                )}
              </div>
              <div>
                <IconButton
                  type="button"
                  onClick={handleProductImageClick}
                  title={t('cms.uploadImage')}
                  icon={isUploading ? <SpinnerIcon /> : <UploadIcon />}
                  aria-busy={isUploading}
                  $size="lg"
                />
                <input
                  type="file"
                  name="productImageInput"
                  aria-label={t('cms.uploadImage')}
                  onChange={(e) =>
                    void handleProductImageChange(e, setFieldValue)
                  }
                  accept={IMAGE_ACCEPT}
                  ref={productImageInputRef}
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <p>{t('common.fields.topSellers')}</p>
                <FormikField name="topSellers" type="checkbox" />
              </div>
              <div>
                <p>{t('common.fields.newRelease')}</p>
                <FormikField name="newRelease" type="checkbox" />
              </div>
            </BookSettingsRow>
          </fieldset>
          <FormButtons>
            <Button
              type={readOnly ? 'button' : 'reset'}
              onClick={onClose}
              $size="sm"
              $color="neutral"
              disabled={isSubmitting || isUploading}>
              {readOnly
                ? t('common.actions.close')
                : t('common.actions.cancel')}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                $size="sm"
                disabled={
                  !dirty || isSubmitting || isUploading || authorsLoading
                }>
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
