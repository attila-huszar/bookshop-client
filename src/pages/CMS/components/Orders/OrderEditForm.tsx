import { FC } from 'react'
import { toast } from 'react-hot-toast'
import { Form, Formik, FormikHelpers } from 'formik'
import { updateOrder } from '@/store'
import { Button, CountrySelect, FormikField } from '@/components'
import { useAppDispatch } from '@/hooks'
import { formatDate, formatPaymentStatus } from '@/helpers'
import { orderSchema } from '@/validation'
import { Order } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import {
  AddressBlock,
  FormButtons,
  MetadataBlock,
  OrderItemBlock,
  OrderItemRow,
  Row,
  SectionHeader,
} from '../../styles'

type Props = {
  editedItem: Order | null
  onClose: () => void
}

export const OrderEditForm: FC<Props> = ({ editedItem, onClose }) => {
  const dispatch = useAppDispatch()

  if (!editedItem) return null

  const handleSubmit = async (values: Order, actions: FormikHelpers<Order>) => {
    try {
      const { id, createdAt, updatedAt, paidAt, ...orderValues } = values
      const result = await dispatch(updateOrder(orderValues))

      if (result?.meta?.requestStatus === 'fulfilled') {
        actions.resetForm()
        toast.success(`Order ${editedItem ? 'updated' : 'added'} successfully`)
        onClose()
      } else {
        toast.error(`Failed to ${editedItem ? 'update' : 'add'} order`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    }
  }

  return (
    <Formik
      key="orders"
      initialValues={editedItem}
      validationSchema={orderSchema}
      onSubmit={handleSubmit}>
      {({ dirty, isSubmitting }) => (
        <Form>
          <SectionHeader>Order Information</SectionHeader>
          <MetadataBlock>
            <div>
              <p>Order ID</p>
              <span>{editedItem.id}</span>
            </div>
            <div>
              <p>Created At</p>
              <span>{formatDate(editedItem.createdAt)}</span>
            </div>
            <div>
              <p>Updated At</p>
              <span>{formatDate(editedItem.updatedAt)}</span>
            </div>
            <div>
              <p>Paid At</p>
              <span>{formatDate(editedItem.paidAt)}</span>
            </div>
          </MetadataBlock>
          <SectionHeader>Payment Details</SectionHeader>
          <Row>
            <div>
              <p>Payment ID</p>
              <FormikField
                name="paymentId"
                placeholder="Payment ID"
                type="text"
                readOnly
              />
            </div>
            <div>
              <p>Payment Status</p>
              <FormikField
                name="paymentStatus"
                placeholder="Payment Status"
                type="text"
                value={formatPaymentStatus(editedItem.paymentStatus)}
                readOnly
              />
            </div>
          </Row>
          <Row>
            <div>
              <p>Total</p>
              <FormikField name="total" placeholder="Total" type="number" />
            </div>
            <div>
              <p>Currency</p>
              <FormikField name="currency" placeholder="Currency" type="text" />
            </div>
          </Row>
          <SectionHeader>Customer Information</SectionHeader>
          <Row>
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
          </Row>
          <Row>
            <div>
              <p>Email</p>
              <FormikField name="email" placeholder="Email" type="email" />
            </div>
            <div>
              <p>Phone</p>
              <FormikField name="phone" placeholder="Phone" type="text" />
            </div>
          </Row>
          <SectionHeader>Shipping Address</SectionHeader>
          <Row>
            <div>
              <p>Name</p>
              <FormikField
                name="shipping.name"
                placeholder="Name"
                type="text"
              />
            </div>
            <div>
              <p>Phone</p>
              <FormikField
                name="shipping.phone"
                placeholder="Phone"
                type="text"
              />
            </div>
          </Row>
          <AddressBlock>
            <p>Address</p>
            <Row>
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
            </Row>
            <Row>
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
            </Row>
            <Row>
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
                <CountrySelect fieldName="shipping.address.country" />
              </div>
            </Row>
          </AddressBlock>
          <SectionHeader>Order Items</SectionHeader>
          <OrderItemBlock>
            <p>Items</p>
            {editedItem.items?.map((item, idx) => (
              <div key={item.id}>
                <OrderItemRow>
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
                </OrderItemRow>
                <Row>
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
                </Row>
              </div>
            ))}
          </OrderItemBlock>
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
