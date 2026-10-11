import { Fragment, useState } from 'react'
import { useOutletContext } from 'react-router'
import { cmsOrdersSelector } from '@/store'
import { Alert, IconButton, Loading } from '@/components'
import { useAppSelector } from '@/hooks'
import { formatDate, formatPaymentStatus, getPaidAtStatus } from '@/helpers'
import { CMSOutletContext } from '@/types'
import { EditIcon, EnvelopeIcon } from '@/assets/svg'
import { TableActions } from '../../styles/CMS.style'
import { OrderEmails } from './OrderEmails'
import { OrdersTable } from './Orders.style'

export const Orders = () => {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const {
    orders: allOrders,
    ordersLoading,
    ordersError,
  } = useAppSelector(cmsOrdersSelector)
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
    return <Loading message="Loading orders" fullScreen />
  }

  if (ordersError) {
    return <Alert message="Error loading orders" error={ordersError} />
  }

  if (orders.length === 0) {
    return (
      <Alert
        type="info"
        message={
          showDeletedOrders ? 'No deleted orders found' : 'No orders found'
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
            <th>ID</th>
            <th>PaymentID</th>
            <th>Status</th>
            <th>Name</th>
            <th>Email</th>
            <th>Total</th>
            <th>Created</th>
            <th>Paid At</th>
            <th className="actions">Actions</th>
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
                      aria-label={`Select order #${order.id}`}
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
                      {order.paymentId ?? 'Draft'}
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
                        title="Edit order"
                        aria-label={`Edit order #${order.id}`}
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
                          title={`${expandedOrderId === order.id ? 'Hide' : 'Show'} emails`}
                          aria-label={`${expandedOrderId === order.id ? 'Hide' : 'Show'} emails for order #${order.id}`}
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
                      <h3>Emails for order #{order.id}</h3>
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
