import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { useCmsOrdersQuery } from '@/store/api/bookshopApi'
import { Alert } from '@/components/Alert'
import { IconButton } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { formatPaymentStatus } from '@/helpers/checkout'
import { formatDate, getPaidAtStatus } from '@/helpers/formatDate'
import { CMSOutletContext } from '@/types'
import { EditIcon, EnvelopeIcon } from '@/assets/svg'
import { TableActions } from '../../styles/CMS.style'
import { OrderEmails } from './OrderEmails'
import { OrdersTable } from './Orders.style'

export const Orders = () => {
  const { t } = useTranslation()

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const {
    data: allOrders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useCmsOrdersQuery()
  const {
    showDeletedOrders,
    selectedItems,
    setSelectedItems,
    setIsDialogOpen,
    setIsEditing,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()
  const orders = allOrders.filter(
    (order) => Boolean(order.deletedAt) === showDeletedOrders,
  )

  if (ordersLoading) {
    return <Loading message={t('cms.ordersLoading')} fullScreen />
  }

  if (ordersError) {
    return <Alert message={t('cms.ordersError')} error={ordersError} />
  }

  if (orders.length === 0) {
    return (
      <Alert
        type="info"
        message={
          showDeletedOrders ? t('cms.ordersRemovedEmpty') : t('cms.ordersEmpty')
        }
      />
    )
  }

  const allSelected =
    orders.length > 0 && selectedItems.orders.length === orders.length

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.id === undefined || b.id === undefined) {
      return 0
    }

    return a.id - b.id
  })

  return (
    <OrdersTable>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                aria-label={t('common.selectAll')}
                checked={allSelected}
                onChange={() =>
                  allSelected
                    ? setSelectedItems({
                        ...selectedItems,
                        orders: [],
                      })
                    : setSelectedItems({
                        ...selectedItems,
                        orders: orders.map((order) => order.id),
                      })
                }
              />
            </th>
            <th>{t('common.fields.id')}</th>
            <th>{t('common.fields.paymentId')}</th>
            <th>{t('common.fields.status')}</th>
            <th>{t('common.fields.name')}</th>
            <th>{t('common.fields.email')}</th>
            <th>{t('common.fields.total')}</th>
            <th>{t('common.fields.createdAt')}</th>
            <th>{t('common.fields.paidAt')}</th>
            <th className="actions">{t('common.fields.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => {
            return (
              <Fragment key={order.id}>
                <tr
                  onClick={() => {
                    setIsEditing(false)
                    setEditedItem(order)
                    setIsDialogOpen(true)
                  }}
                  className={
                    selectedItems.orders.includes(order.id) ? 'selected' : ''
                  }>
                  <td
                    style={{ textAlign: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItems((prev) => ({
                        ...prev,
                        orders: prev.orders.includes(order.id)
                          ? prev.orders.filter((id) => id !== order.id)
                          : [...prev.orders, order.id],
                      }))
                    }}>
                    <input
                      type="checkbox"
                      aria-label={t('cms.selectRecord', {
                        entity: t('common.fields.order').toLocaleLowerCase(),
                        id: order.id,
                      })}
                      checked={selectedItems.orders.includes(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => {
                        setSelectedItems((prev) => ({
                          ...prev,
                          orders: prev.orders.includes(order.id)
                            ? prev.orders.filter((id) => id !== order.id)
                            : [...prev.orders, order.id],
                        }))
                      }}
                    />
                  </td>
                  <td>{order.id}</td>
                  <td>
                    <p style={{ width: 96, wordWrap: 'break-word' }}>
                      {order.paymentId ?? t('orders.draft')}
                    </p>
                  </td>
                  <td>{formatPaymentStatus(order.paymentStatus)}</td>
                  <td>
                    {[order.firstName, order.lastName]
                      .filter(Boolean)
                      .join(' ')}
                  </td>
                  <td>{order.email}</td>
                  <td>{order.total}</td>
                  <td style={{ fontSize: '0.75rem' }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    {getPaidAtStatus(order)}
                  </td>
                  <td className="actions">
                    <TableActions>
                      <IconButton
                        type="button"
                        title={t('cms.edit', {
                          entity: t('common.fields.order').toLocaleLowerCase(),
                        })}
                        aria-label={t('cms.editRecord', {
                          entity: t('common.fields.order').toLocaleLowerCase(),
                          id: order.id,
                        })}
                        disabled={!order.paymentId}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditing(true)
                          setIsDialogOpen(true)
                          setEditedItem(order)
                        }}
                        icon={<EditIcon aria-hidden="true" />}
                        $size="sm"
                      />
                      {order.paymentId && (
                        <IconButton
                          type="button"
                          $size="sm"
                          icon={<EnvelopeIcon aria-hidden="true" />}
                          title={t(
                            expandedOrderId === order.id
                              ? 'cms.hideEmails'
                              : 'cms.showEmails',
                          )}
                          aria-label={t('cms.orderEmails', {
                            action: t(
                              expandedOrderId === order.id
                                ? 'cms.hideEmails'
                                : 'cms.showEmails',
                            ),
                            id: order.id,
                          })}
                          aria-expanded={expandedOrderId === order.id}
                          aria-controls={`order-${order.id}-emails`}
                          onClick={(event) => {
                            event.stopPropagation()
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id,
                            )
                          }}
                        />
                      )}
                    </TableActions>
                  </td>
                </tr>
                {expandedOrderId === order.id && order.paymentId && (
                  <tr className="email-history" id={`order-${order.id}-emails`}>
                    <td colSpan={10} className="email-history-cell">
                      <h3>{t('cms.emailsForOrder', { id: order.id })}</h3>
                      <OrderEmails paymentId={order.paymentId} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </OrdersTable>
  )
}
