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
  const { t, i18n } = useTranslation()

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
      toast.success(
        i18n.t('cms.saved', { entity: i18n.t('common.fields.order') }),
      )
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
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
                  <FormikField
                    label={t('common.fields.paymentId')}
                    value={editedItem.paymentId ?? ''}
                    placeholder={t('common.fields.paymentId')}
                    type="text"
                    readOnly
                  />
                </div>
                <div>
                  <FormikField
                    label={t('common.fields.paymentStatus')}
                    placeholder={t('common.fields.paymentStatus')}
                    type="text"
                    value={formatPaymentStatus(editedItem.paymentStatus)}
                    readOnly
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <FormikField
                    label={t('common.fields.total')}
                    value={editedItem.total}
                    placeholder={t('common.fields.total')}
                    type="number"
                    readOnly
                  />
                </div>
                <div>
                  <FormikField
                    label={t('common.fields.currency')}
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
                  <FormikField
                    label={t('common.fields.firstName')}
                    name="firstName"
                    placeholder={t('common.fields.firstName')}
                    type="text"
                  />
                </div>
                <div>
                  <FormikField
                    label={t('common.fields.lastName')}
                    name="lastName"
                    placeholder={t('common.fields.lastName')}
                    type="text"
                  />
                </div>
              </Row>
              <Row>
                <div>
                  <FormikField
                    label={t('common.fields.email')}
                    name="email"
                    placeholder={t('common.fields.email')}
                    type="email"
                  />
                </div>
              </Row>
              <SectionHeader>{t('cms.shippingAddress')}</SectionHeader>
              <Row>
                <div>
                  <FormikField
                    label={t('common.fields.name')}
                    name="shipping.name"
                    placeholder={t('common.fields.name')}
                    type="text"
                  />
                </div>
                <div>
                  <FormikField
                    label={t('common.fields.phone')}
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
                    <FormikField
                      label={t('common.fields.line1')}
                      name="shipping.address.line1"
                      placeholder={t('common.fields.line1')}
                      type="text"
                    />
                  </div>
                  <div>
                    <FormikField
                      label={t('common.fields.line2')}
                      name="shipping.address.line2"
                      placeholder={t('common.fields.line2')}
                      type="text"
                    />
                  </div>
                </Row>
                <Row>
                  <div>
                    <FormikField
                      label={t('common.fields.city')}
                      name="shipping.address.city"
                      placeholder={t('common.fields.city')}
                      type="text"
                    />
                  </div>
                  <div>
                    <FormikField
                      label={t('common.fields.state')}
                      name="shipping.address.state"
                      placeholder={t('common.fields.state')}
                      type="text"
                    />
                  </div>
                </Row>
                <Row>
                  <div>
                    <FormikField
                      label={t('common.fields.postalCode')}
                      name="shipping.address.postal_code"
                      placeholder={t('common.fields.postalCode')}
                      type="text"
                    />
                  </div>
                  <div>
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
                        <FormikField
                          label={t('common.fields.id')}
                          value={item.id}
                          readOnly
                          placeholder={t('common.fields.id')}
                          type="number"
                        />
                      </div>
                      <div>
                        <FormikField
                          label={t('common.fields.author')}
                          value={item.author ?? ''}
                          readOnly
                          placeholder={t('common.fields.author')}
                          type="text"
                        />
                      </div>
                      <div>
                        <FormikField
                          label={t('common.fields.title')}
                          value={item.title}
                          readOnly
                          placeholder={t('common.fields.title')}
                          type="text"
                        />
                      </div>
                    </OrderItemRow>
                    <Row>
                      <div>
                        <FormikField
                          label={t('common.fields.price')}
                          value={item.price}
                          readOnly
                          placeholder={t('common.fields.price')}
                          type="number"
                        />
                      </div>
                      <div>
                        <FormikField
                          label={t('common.fields.discount')}
                          value={item.discount}
                          readOnly
                          placeholder={t('common.fields.discount')}
                          type="number"
                        />
                      </div>
                      <div>
                        <FormikField
                          label={t('common.fields.quantity')}
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
