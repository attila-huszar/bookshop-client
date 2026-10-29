import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Formik, FormikHelpers } from 'formik'
import { useUpdateOrderMutation } from '@/store/api/ordersApi'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { CountrySelect } from '@/components/CountrySelect'
import { FormikField } from '@/components/FormikField'
import { formatPaymentStatus } from '@/helpers/checkout'
import { getErrorMessage } from '@/helpers/errors'
import { formatDate } from '@/helpers/formatDate'
import { orderCustomerUpdateSchema } from '@/validation/orderSchemas'
import type { CmsOrderUpdate, Order } from '@/types'
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

type OrderFormValues = Pick<
  Order,
  'firstName' | 'lastName' | 'email' | 'shipping'
>

type Props = {
  editedItem: Order | null
  onClose: () => void
  readOnly?: boolean
}

export const OrderEditForm: FC<Props> = ({ editedItem, onClose, readOnly }) => {
  const { t } = useTranslation()

  const [updateOrder] = useUpdateOrderMutation()

  if (!editedItem) {
    return null
  }

  const isReadOnly = readOnly === true || !editedItem.paymentId

  const initialValues: OrderFormValues = {
    firstName: editedItem.firstName ?? '',
    lastName: editedItem.lastName ?? '',
    email: editedItem.email ?? '',
    shipping: editedItem.shipping,
  }

  const handleSubmit = async (
    values: OrderFormValues,
    actions: FormikHelpers<OrderFormValues>,
  ) => {
    if (!editedItem.paymentId) {
      return
    }

    try {
      const payload: CmsOrderUpdate = {
        firstName: values.firstName?.trim() || null,
        lastName: values.lastName?.trim() || null,
        email: values.email?.trim() || null,
        shipping: values.shipping,
        paymentId: editedItem.paymentId,
      }
      await updateOrder(payload).unwrap()
      actions.resetForm()
      toast.success(t('cms.saved', { entity: t('common.fields.order') }))
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error, t('common.unexpectedError')))
    }
  }

  return (
    <Formik
      key="orders"
      initialValues={initialValues}
      validationSchema={orderCustomerUpdateSchema}
      onSubmit={handleSubmit}>
      {({ dirty, isSubmitting }) => {
        return (
          <Form>
            {!editedItem.paymentId && <p>{t('cms.draftReadOnly')}</p>}
            <fieldset disabled={isReadOnly}>
              <MetadataBlock>
                <div>
                  <p>
                    {t('cms.recordId', { entity: t('common.fields.order') })}
                  </p>
                  <span>{editedItem.id}</span>
                </div>
                <div>
                  <p>{t('common.fields.createdAt')}</p>
                  <span>{formatDate(editedItem.createdAt)}</span>
                </div>
                <div>
                  <p>{t('common.fields.updatedAt')}</p>
                  <span>{formatDate(editedItem.updatedAt)}</span>
                </div>
                <div>
                  <p>{t('common.fields.paidAt')}</p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2.25rem',
                    }}>
                    <span>{formatDate(editedItem.paidAt)}</span>
                  </div>
                </div>
              </MetadataBlock>
              <SectionHeader>{t('cms.paymentDetails')}</SectionHeader>
              <Row>
                <div>
                  <p>{t('common.fields.paymentId')}</p>
                  <FormikField
                    value={editedItem.paymentId ?? ''}
                    placeholder={t('common.fields.paymentId')}
                    type="text"
                    readOnly
                  />
                </div>
                <div>
                  <p>{t('common.fields.paymentStatus')}</p>
                  <FormikField
                    placeholder={t('common.fields.paymentStatus')}
                    type="text"
                    value={formatPaymentStatus(editedItem.paymentStatus)}
                    readOnly
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <p>{t('common.fields.total')}</p>
                  <FormikField
                    value={editedItem.total}
                    placeholder={t('common.fields.total')}
                    type="number"
                    readOnly
                  />
                </div>
                <div>
                  <p>{t('common.fields.currency')}</p>
                  <FormikField
                    value={editedItem.currency}
                    readOnly
                    placeholder={t('common.fields.currency')}
                    type="text"
                  />
                </div>
              </Row>
              <SectionHeader>{t('cms.customerInformation')}</SectionHeader>
              <Row>
                <div>
                  <p>{t('common.fields.firstName')}</p>
                  <FormikField
                    name="firstName"
                    placeholder={t('common.fields.firstName')}
                    type="text"
                  />
                </div>
                <div>
                  <p>{t('common.fields.lastName')}</p>
                  <FormikField
                    name="lastName"
                    placeholder={t('common.fields.lastName')}
                    type="text"
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <p>{t('common.fields.email')}</p>
                  <FormikField
                    name="email"
                    placeholder={t('common.fields.email')}
                    type="email"
                  />
                </div>
              </Row>
              <SectionHeader>{t('cms.shippingAddress')}</SectionHeader>
              <Row>
                <div>
                  <p>{t('common.fields.name')}</p>
                  <FormikField
                    name="shipping.name"
                    placeholder={t('common.fields.name')}
                    type="text"
                  />
                </div>
                <div>
                  <p>{t('common.fields.phone')}</p>
                  <FormikField
                    name="shipping.phone"
                    placeholder={t('common.fields.phone')}
                    type="text"
                  />
                </div>
              </Row>
              <AddressBlock>
                <p>{t('common.fields.address')}</p>
                <Row>
                  <div>
                    <p>{t('common.fields.line1')}</p>
                    <FormikField
                      name="shipping.address.line1"
                      placeholder={t('common.fields.line1')}
                      type="text"
                    />
                  </div>
                  <div>
                    <p>{t('common.fields.line2')}</p>
                    <FormikField
                      name="shipping.address.line2"
                      placeholder={t('common.fields.line2')}
                      type="text"
                    />
                  </div>
                </Row>
                <Row>
                  <div>
                    <p>{t('common.fields.city')}</p>
                    <FormikField
                      name="shipping.address.city"
                      placeholder={t('common.fields.city')}
                      type="text"
                    />
                  </div>
                  <div>
                    <p>{t('common.fields.state')}</p>
                    <FormikField
                      name="shipping.address.state"
                      placeholder={t('common.fields.state')}
                      type="text"
                    />
                  </div>
                </Row>
                <Row>
                  <div>
                    <p>{t('common.fields.postalCode')}</p>
                    <FormikField
                      name="shipping.address.postal_code"
                      placeholder={t('common.fields.postalCode')}
                      type="text"
                    />
                  </div>
                  <div>
                    <p>{t('common.fields.country')}</p>
                    <CountrySelect
                      fieldName="shipping.address.country"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Row>
              </AddressBlock>
              <SectionHeader>{t('cms.orderItems')}</SectionHeader>
              <OrderItemBlock>
                <p>{t('common.fields.items')}</p>
                {editedItem.items?.map((item) => (
                  <div key={item.id}>
                    <OrderItemRow>
                      <div>
                        <p>{t('common.fields.id')}</p>
                        <FormikField
                          value={item.id}
                          readOnly
                          placeholder={t('common.fields.id')}
                          type="number"
                        />
                      </div>
                      <div>
                        <p>{t('common.fields.author')}</p>
                        <FormikField
                          value={item.author ?? ''}
                          readOnly
                          placeholder={t('common.fields.author')}
                          type="text"
                        />
                      </div>
                      <div>
                        <p>{t('common.fields.title')}</p>
                        <FormikField
                          value={item.title}
                          readOnly
                          placeholder={t('common.fields.title')}
                          type="text"
                        />
                      </div>
                    </OrderItemRow>
                    <Row>
                      <div>
                        <p>{t('common.fields.price')}</p>
                        <FormikField
                          value={item.price}
                          readOnly
                          placeholder={t('common.fields.price')}
                          type="number"
                        />
                      </div>
                      <div>
                        <p>{t('common.fields.discount')}</p>
                        <FormikField
                          value={item.discount}
                          readOnly
                          placeholder={t('common.fields.discount')}
                          type="number"
                        />
                      </div>
                      <div>
                        <p>{t('common.fields.quantity')}</p>
                        <FormikField
                          value={item.quantity}
                          readOnly
                          placeholder={t('common.fields.quantity')}
                          type="number"
                        />
                      </div>
                    </Row>
                  </div>
                ))}
              </OrderItemBlock>
            </fieldset>
            <FormButtons>
              <Button
                type={isReadOnly ? 'button' : 'reset'}
                onClick={onClose}
                $size="sm"
                $color="neutral"
                disabled={isSubmitting}>
                {isReadOnly
                  ? t('common.actions.close')
                  : t('common.actions.cancel')}
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  $size="sm"
                  disabled={!dirty || isSubmitting}>
                  {isSubmitting && <SpinnerIcon height={22} />}
                  {t('common.actions.save')}
                </Button>
              )}
            </FormButtons>
          </Form>
        )
      }}
    </Formik>
  )
}
