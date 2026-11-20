import { Fragment, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { useCmsOrdersQuery } from '@/store/api/ordersApi'
import { Alert } from '@/components/Alert'
import { IconButton } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { Pagination } from '@/components/Pagination'
import { useCmsPagination } from '@/hooks/useCmsPagination'
import { formatPaymentStatus } from '@/helpers/checkout'
import { formatDate, getPaidAtStatus } from '@/helpers/formatDate'
import { type CMSOutletContext, CmsTab } from '@/types'
import { EditIcon, EnvelopeIcon } from '@/assets/svg'
import { LoadingContainer, TableActions } from '../../styles/CMS.style'
import { OrderEmails } from './OrderEmails'
import { OrdersTable } from './Orders.style'

export const Orders = () => {
  const { t } = useTranslation()
  const captionId = useId()

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const {
    data: allOrders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useCmsOrdersQuery(undefined, { refetchOnMountOrArgChange: true })
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
  const { currentPage, itemsPerPage, pageStart, onPageChange } =
    useCmsPagination(CmsTab.Orders, orders.length)

  if (ordersLoading) {
    return (
      <LoadingContainer>
        <Loading message={t('cms.ordersLoading')} />
      </LoadingContainer>
    )
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

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
      b.id - a.id,
  )
  const visibleOrders = sortedOrders.slice(pageStart, pageStart + itemsPerPage)
  const allSelected = visibleOrders.every((order) =>
    selectedItems.orders.includes(order.id),
  )

  return (
    <>
      <OrdersTable aria-labelledby={captionId}>
        <table>
          <caption id={captionId}>
            {t('cms.entities.order', { count: 2 })}
          </caption>
          <thead>
            <tr>
              <th scope="col">
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
                          orders: visibleOrders.map((order) => order.id),
                        })
                  }
                />
              </th>
              <th scope="col">{t('common.fields.id')}</th>
              <th scope="col">{t('common.fields.paymentId')}</th>
              <th scope="col">{t('common.fields.status')}</th>
              <th scope="col">{t('common.fields.name')}</th>
              <th scope="col">{t('common.fields.email')}</th>
              <th scope="col">{t('common.fields.total')}</th>
              <th scope="col">{t('common.fields.createdAt')}</th>
              <th scope="col">{t('common.fields.paidAt')}</th>
              <th scope="col" className="actions">
                {t('common.fields.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => {
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
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{getPaidAtStatus(order)}</td>
                    <td className="actions">
                      <TableActions>
                        <IconButton
                          type="button"
                          title={t('cms.edit', {
                            entity: t(
                              'common.fields.order',
                            ).toLocaleLowerCase(),
                          })}
                          aria-label={t('cms.editRecord', {
                            entity: t(
                              'common.fields.order',
                            ).toLocaleLowerCase(),
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
                    <tr
                      className="email-history"
                      id={`order-${order.id}-emails`}>
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
      <Pagination
        total={orders.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => {
          setExpandedOrderId(null)
          onPageChange(page)
        }}
      />
    </>
  )
}
