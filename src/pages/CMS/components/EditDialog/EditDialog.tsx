import { FC, useEffect, useState } from 'react'
import { Form, Formik, FormikHelpers, FormikState } from 'formik'
import { toast } from 'react-hot-toast'
import {
  FormButtons,
  TitleRow,
  DefaultRow,
  StyledEditDialog,
  SettingsRow,
  AddressBlock,
  ItemBlock,
  ItemRow,
  GenreRow,
} from './EditDialog.style'
import { Button, FormikField, IconButton } from '@/components'
import { addAuthor, addBook } from '@/store'
import { useAppDispatch, useAppSelector, useDebounce } from '@/hooks'
import { authorSchema, bookSchema, userSchema } from '@/validation'
import {
  initialAuthorValues,
  initialBookValues,
  initialOrderValues,
  initialUserValues,
} from './initialValues'
import {
  Author,
  AuthorFormValues,
  BookFormValues,
  BookInDB,
  Order,
  OrderFormValues,
  User,
  UserFormValues,
} from '@/types'
import { SelectContext } from '@/pages/CMS/CMS.types'
import { SpinnerIcon, UploadIcon } from '@/assets/svg'

type Props = {
  ref: React.RefObject<HTMLDialogElement | null>
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  activeTab: keyof SelectContext
  editedItem:
    | BookFormValues
    | AuthorFormValues
    | OrderFormValues
    | UserFormValues
    | null
  setEditedItem: React.Dispatch<
    React.SetStateAction<BookInDB | Author | Order | User | null>
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

  if (!isDialogOpen) return null

  const actionMap = {
    books: {
      action: editedItem ? null : addBook, //TODO: Implement book edit action
      success: `Book ${editedItem ? 'updated' : 'added'} successfully`,
      error: `Failed to ${editedItem ? 'update' : 'add'} book`,
    },
    authors: {
      action: editedItem ? null : addAuthor, //TODO: Implement author edit action
      success: `Author ${editedItem ? 'updated' : 'added'} successfully`,
      error: `Failed to ${editedItem ? 'update' : 'add'} author`,
    },
    orders: {
      action: null, //TODO: Implement order actions
      success: 'Order updated successfully',
      error: 'Failed to update order',
    },
    users: {
      action: null, //TODO: Implement user actions
      success: 'User updated successfully',
      error: 'Failed to update user',
    },
  }

  const initialValuesMap = {
    books: editedItem ?? initialBookValues,
    authors: editedItem ?? initialAuthorValues,
    orders: editedItem ?? initialOrderValues,
    users: editedItem ?? initialUserValues,
  }

  const handleSubmit = async (
    values:
      | BookFormValues
      | AuthorFormValues
      | OrderFormValues
      | UserFormValues,
    actions: FormikHelpers<
      BookFormValues | AuthorFormValues | OrderFormValues | UserFormValues
    >,
  ) => {
    try {
      let result
      const config = actionMap[activeTab]

      if (!config.action) {
        toast('Action not implemented yet', {
          icon: '🥺',
          style: { backgroundColor: 'var(--secondary-hover)' },
        })
        return
      }

      switch (activeTab) {
        case 'books': {
          const bookValues = values as BookFormValues
          const submitValues = {
            ...bookValues,
            authorId: Number(bookValues.authorId),
          }
          //@ts-expect-error Union type handling
          result = await dispatch(config.action(submitValues))
          break
        }
        case 'authors': {
          const authorValues = values as AuthorFormValues
          //@ts-expect-error Union type handling
          result = await dispatch(config.action(authorValues))
          break
        }
        case 'orders':
        case 'users':
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
          <FormikField name="address.line1" placeholder="Line 1" type="text" />
        </div>
        <div>
          <p>Line 2</p>
          <FormikField name="address.line2" placeholder="Line 2" type="text" />
        </div>
      </DefaultRow>
      <DefaultRow>
        <div>
          <p>City</p>
          <FormikField name="address.city" placeholder="City" type="text" />
        </div>
        <div>
          <p>State</p>
          <FormikField name="address.state" placeholder="State" type="text" />
        </div>
      </DefaultRow>
      <DefaultRow>
        <div>
          <p>Postal Code</p>
          <FormikField
            name="address.postal_code"
            placeholder="Postal Code"
            type="text"
          />
        </div>
        <div>
          <p>Country</p>
          <FormikField
            name="address.country"
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
        {editedItem.items.map((item, idx) => (
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
            //validationSchema={orderSchema}
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
                  <div>
                    <p>Payment Status</p>
                    <FormikField
                      name="paymentIntentStatus"
                      placeholder="Payment Status"
                      type="text"
                    />
                  </div>
                  <div>
                    <p>Order Status</p>
                    <FormikField
                      name="orderStatus"
                      placeholder="Order Status"
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
                  <div>
                    <p>Currency</p>
                    <FormikField
                      name="currency"
                      placeholder="Currency"
                      type="text"
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
            {({ values, isSubmitting }) => (
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
                      const bookValues = values as BookFormValues
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
                        src={(values as BookFormValues).imgUrl}
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
                      onClick={() => undefined}
                      title="Upload Image"
                      icon={<UploadIcon />}
                      $iconSize="lg"
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
