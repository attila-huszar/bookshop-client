import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik, FormikHelpers, FormikState } from 'formik'
import { uploadProductImage } from '@/api'
import {
  addAuthor,
  addBook,
  addOrder,
  addUser,
  updateAuthor,
  updateBook,
  updateOrder,
  updateUser,
} from '@/store'
import { Button, FormikField, IconButton } from '@/components'
import { useAppDispatch, useAppSelector, useDebounce } from '@/hooks'
import { log } from '@/services'
import {
  authorSchema,
  bookSchema,
  orderSchema,
  userSchema,
  validateImageFile,
} from '@/validation'
import {
  Author,
  BookWithAuthorId,
  Order,
  SelectContext,
  User,
  UserFormValues,
  UserWithMetadata,
} from '@/types'
import { SpinnerIcon, UploadIcon } from '@/assets/svg'
import {
  AddressBlock,
  DefaultRow,
  FormButtons,
  GenreRow,
  ItemBlock,
  ItemRow,
  SettingsRow,
  StyledEditDialog,
  TitleRow,
} from './EditDialog.style'
import {
  initialAuthorValues,
  initialBookValues,
  initialOrderValues,
  initialUserValues,
} from './initialValues'

type Props = {
  ref: React.RefObject<HTMLDialogElement | null>
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  activeTab: keyof SelectContext
  editedItem: BookWithAuthorId | Author | Order | UserFormValues | null
  setEditedItem: React.Dispatch<
    React.SetStateAction<BookWithAuthorId | Author | Order | User | null>
  >
}

export const EditDialog: FC<Props> = ({
  ref,
  isDialogOpen,
  setIsDialogOpen,
  activeTab,
  editedItem,
  setEditedItem,
}) => {
  const dispatch = useAppDispatch()
  const { authors } = useAppSelector((state) => state.cms)
  const [showBookCover, setShowBookCover] = useState<boolean>(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const productImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isDialogOpen) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [isDialogOpen, ref])

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

  if (!isDialogOpen) return null

  const actionMap = {
    books: {
      action: editedItem ? updateBook : addBook,
      success: `Book ${editedItem ? 'updated' : 'added'} successfully`,
      error: `Failed to ${editedItem ? 'update' : 'add'} book`,
    },
    authors: {
      action: editedItem ? updateAuthor : addAuthor,
      success: `Author ${editedItem ? 'updated' : 'added'} successfully`,
      error: `Failed to ${editedItem ? 'update' : 'add'} author`,
    },
    orders: {
      action: editedItem ? updateOrder : addOrder,
      success: `Order ${editedItem ? 'updated' : 'added'} successfully`,
      error: `Failed to ${editedItem ? 'update' : 'add'} order`,
    },
    users: {
      action: editedItem ? updateUser : addUser,
      success: `User ${editedItem ? 'updated' : 'added'} successfully`,
      error: `Failed to ${editedItem ? 'update' : 'add'} user`,
    },
  }

  const initialValuesMap = {
    books: editedItem ?? initialBookValues,
    authors: editedItem ?? initialAuthorValues,
    orders: editedItem ?? initialOrderValues,
    users: editedItem ?? initialUserValues,
  }

  const handleSubmit = async (
    values: BookWithAuthorId | Author | Order | UserFormValues,
    actions: FormikHelpers<BookWithAuthorId | Author | Order | UserFormValues>,
  ) => {
    try {
      let result
      const config = actionMap[activeTab]

      switch (activeTab) {
        case 'books': {
          result = await dispatch(
            (config.action as typeof addBook)(values as BookWithAuthorId),
          )
          break
        }
        case 'authors': {
          result = await dispatch(
            (config.action as typeof addAuthor)(values as Author),
          )
          break
        }
        case 'orders': {
          result = await dispatch(
            (config.action as typeof addOrder)(values as Order),
          )
          break
        }
        case 'users': {
          result = await dispatch(
            (config.action as typeof addUser)(values as UserWithMetadata),
          )
          break
        }
        default:
          return
      }

      if (result?.meta?.requestStatus === 'fulfilled') {
        actions.resetForm()
        toast.success(config.success)
        setIsDialogOpen(false)
        setEditedItem(null)
      } else {
        toast.error(config.error)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    }
  }

  const renderButtons = ({ isSubmitting }: Partial<FormikState<unknown>>) => (
    <FormButtons>
      <Button
        type="reset"
        onClick={() => {
          setIsDialogOpen(false)
          setEditedItem(null)
        }}
        $size="sm"
        $inverted>
        Cancel
      </Button>
      <Button type="submit" $size="sm">
        {isSubmitting ? <SpinnerIcon height={22} /> : 'Save'}
      </Button>
    </FormButtons>
  )

  const renderAddressBlock = () => (
    <AddressBlock>
      <p>Address</p>
      <DefaultRow>
        <div>
          <p>Line 1</p>
          <FormikField
            name="shipping.address.line1"
            placeholder="Line 1"
            type="text"
          />
        </div>
        <div>
          <p>Line 2</p>
          <FormikField
            name="shipping.address.line2"
            placeholder="Line 2"
            type="text"
          />
        </div>
      </DefaultRow>
      <DefaultRow>
        <div>
          <p>City</p>
          <FormikField
            name="shipping.address.city"
            placeholder="City"
            type="text"
          />
        </div>
        <div>
          <p>State</p>
          <FormikField
            name="shipping.address.state"
            placeholder="State"
            type="text"
          />
        </div>
      </DefaultRow>
      <DefaultRow>
        <div>
          <p>Postal Code</p>
          <FormikField
            name="shipping.address.postal_code"
            placeholder="Postal Code"
            type="text"
          />
        </div>
        <div>
          <p>Country</p>
          <FormikField
            name="shipping.address.country"
            placeholder="Country"
            type="text"
          />
        </div>
      </DefaultRow>
    </AddressBlock>
  )

  const renderItemBlock = () => {
    if (!editedItem || !('items' in editedItem)) {
      return null
    }

    return (
      <ItemBlock>
        <p>Items</p>
        {editedItem.items?.map((item, idx) => (
          <div key={item.id}>
            <ItemRow>
              <div>
                <p>ID</p>
                <FormikField
                  name={`items.${idx}.id`}
                  placeholder="ID"
                  type="number"
                />
              </div>
              <div>
                <p>Author</p>
                <FormikField
                  name={`items.${idx}.author`}
                  placeholder="Author"
                  type="text"
                />
              </div>
              <div>
                <p>Title</p>
                <FormikField
                  name={`items.${idx}.title`}
                  placeholder="Title"
                  type="text"
                />
              </div>
            </ItemRow>
            <DefaultRow>
              <div>
                <p>Price</p>
                <FormikField
                  name={`items.${idx}.price`}
                  placeholder="Price"
                  type="number"
                />
              </div>
              <div>
                <p>Discount</p>
                <FormikField
                  name={`items.${idx}.discount`}
                  placeholder="Discount"
                  type="number"
                />
              </div>
              <div>
                <p>Quantity</p>
                <FormikField
                  name={`items.${idx}.quantity`}
                  placeholder="Quantity"
                  type="number"
                />
              </div>
            </DefaultRow>
          </div>
        ))}
      </ItemBlock>
    )
  }

  const renderForm = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <Formik
            key={activeTab}
            initialValues={initialValuesMap[activeTab]}
            validationSchema={orderSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <DefaultRow>
                  <div>
                    <p>Payment ID</p>
                    <FormikField
                      name="paymentId"
                      placeholder="Payment ID"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>First Name</p>
                    <FormikField
                      name="firstName"
                      placeholder="First Name"
                      type="text"
                    />
                  </div>
                  <div>
                    <p>Last Name</p>
                    <FormikField
                      name="lastName"
                      placeholder="Last Name"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Email</p>
                    <FormikField
                      name="email"
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                  <div>
                    <p>Phone</p>
                    <FormikField name="phone" placeholder="Phone" type="text" />
                  </div>
                </DefaultRow>
                {renderAddressBlock()}
                {renderItemBlock()}
                <DefaultRow>
                  <div>
                    <p>Total</p>
                    <FormikField
                      name="total"
                      placeholder="Total"
                      type="number"
                    />
                  </div>
                </DefaultRow>
                {renderButtons({ isSubmitting })}
              </Form>
            )}
          </Formik>
        )
      case 'books':
        return (
          <Formik
            key={activeTab}
            initialValues={initialValuesMap[activeTab]}
            validationSchema={bookSchema}
            onSubmit={handleSubmit}>
            {({ values, isSubmitting, setFieldValue }) => (
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
                      type="textarea"
                      rows={4}
                    />
                  </div>
                </DefaultRow>
                <GenreRow>
                  <div>
                    <p>Genre</p>
                    <FormikField name="genre" placeholder="Genre" type="text" />
                  </div>
                  <div>
                    <p>Rating</p>
                    <FormikField
                      name="rating"
                      placeholder="Rating"
                      type="number"
                    />
                  </div>
                </GenreRow>
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
                      const bookValues = values as BookWithAuthorId
                      const price = Number(bookValues.price) || 0
                      const discount = Number(bookValues.discount) || 0
                      const discountPrice = (
                        price *
                        (1 - discount / 100)
                      ).toFixed(2)

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
                </DefaultRow>
                <SettingsRow>
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
                        src={(values as BookWithAuthorId).imgUrl}
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
                </SettingsRow>
                {renderButtons({ isSubmitting })}
              </Form>
            )}
          </Formik>
        )
      case 'authors':
        return (
          <Formik
            key={activeTab}
            initialValues={initialValuesMap[activeTab]}
            validationSchema={authorSchema}
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
                    <FormikField
                      name="birthYear"
                      placeholder="Birth"
                      type="text"
                    />
                  </div>
                  <div>
                    <p>Death</p>
                    <FormikField
                      name="deathYear"
                      placeholder="Death"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Biography</p>
                    <FormikField
                      name="biography"
                      placeholder="Biography"
                      type="textarea"
                      rows={4}
                    />
                  </div>
                </DefaultRow>
                {renderButtons({ isSubmitting })}
              </Form>
            )}
          </Formik>
        )
      case 'users':
        return (
          <Formik
            key={activeTab}
            initialValues={initialValuesMap[activeTab]}
            validationSchema={userSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <DefaultRow>
                  <div>
                    <p>First Name</p>
                    <FormikField
                      name="firstName"
                      placeholder="First Name"
                      type="text"
                    />
                  </div>
                  <div>
                    <p>Last Name</p>
                    <FormikField
                      name="lastName"
                      placeholder="Last Name"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Email</p>
                    <FormikField
                      name="email"
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                  <div>
                    <p>Role</p>
                    <FormikField name="role" placeholder="Role" type="text" />
                  </div>
                </DefaultRow>
                <DefaultRow>
                  <div>
                    <p>Phone</p>
                    <FormikField name="phone" placeholder="Phone" type="text" />
                  </div>
                  <div>
                    <p>Avatar URL</p>
                    <FormikField
                      name="avatar"
                      placeholder="Avatar URL"
                      type="text"
                    />
                  </div>
                </DefaultRow>
                {renderAddressBlock()}
                {renderButtons({ isSubmitting })}
              </Form>
            )}
          </Formik>
        )
    }
  }

  return (
    <StyledEditDialog ref={ref} onCancel={() => setIsDialogOpen(false)}>
      {renderForm()}
    </StyledEditDialog>
  )
}
