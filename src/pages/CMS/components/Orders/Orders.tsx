import { useOutletContext } from 'react-router'
import { cmsOrdersSelector } from '@/store'
import { Alert, IconButton } from '@/components'
import { useAppSelector } from '@/hooks'
import { formatDate, formatPaymentStatus, getPaidAtStatus } from '@/helpers'
import { CMSOutletContext } from '@/types'
import { EditIcon } from '@/assets/svg'
import { StyledTable } from '../../styles/CMS.style'

export const Orders = () => {
  const { orders, ordersLoading, ordersError } =
    useAppSelector(cmsOrdersSelector)
  const {
    selectedItems,
    setSelectedItems,
    setIsEditDialogOpen,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()

  if (ordersError) {
    return <Alert message="Error loading orders" error={ordersError} />
  }

  if (!ordersLoading && orders.length === 0) {
    return <Alert message="No orders found" />
  }

  const allSelected =
    orders.length > 0 && selectedItems.orders.length === orders.length

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.id === undefined || b.id === undefined) return 0
    return a.id - b.id
  })

  return (
    <StyledTable>
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
            <th style={{ width: 40, padding: 0 }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => {
            return (
              <tr
                key={order.id}
                onClick={() => {
                  setSelectedItems({
                    ...selectedItems,
                    orders: selectedItems.orders.includes(order.id)
                      ? selectedItems.orders.filter((id) => id !== order.id)
                      : [...selectedItems.orders, order.id],
                  })
                }}
                className={
                  selectedItems.orders.includes(order.id) ? 'selected' : ''
                }>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
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
                    {order.paymentId}
                  </p>
                </td>
                <td>{formatPaymentStatus(order.paymentStatus)}</td>
                <td>
                  {[order.firstName, order.lastName].filter(Boolean).join(' ')}
                </td>
                <td>{order.email}</td>
                <td>{order.total}</td>
                <td style={{ fontSize: '0.75rem' }}>
                  {formatDate(order.createdAt)}
                </td>
                <td style={{ fontSize: '0.75rem' }}>
                  {getPaidAtStatus(order)}
                </td>
                <td style={{ padding: 0 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditDialogOpen(true)
                      setEditedItem(order)
                    }}
                    icon={<EditIcon />}
                    $size="sm"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
