import { useOutletContext } from 'react-router'
import { StyledTable } from '../Tabs/Tabs.style'
import { Alert, IconButton } from '@/components'
import { cmsOrdersSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { SelectContext } from '../../CMS.types'
import { EditIcon } from '@/assets/svg'
import { BookInDB, Author, OrderInDB, User } from '@/types'

export const Orders = () => {
  const { orders, ordersLoading, ordersError } =
    useAppSelector(cmsOrdersSelector)
  const {
    selectedItems,
    setSelectedItems,
    setIsEditDialogOpen,
    setEditedItem,
  } = useOutletContext<{
    selectedItems: SelectContext
    setSelectedItems: React.Dispatch<React.SetStateAction<SelectContext>>
    setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    setEditedItem: React.Dispatch<
      React.SetStateAction<BookInDB | Author | OrderInDB | User | null>
    >
  }>()

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
            <th>Payment Status</th>
            <th>Order Status</th>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Items</th>
            <th>Total</th>
            <th>Curr</th>
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
                <td>{order.paymentIntentStatus}</td>
                <td>{order.orderStatus}</td>
                <td>
                  {[order.firstName, order.lastName].filter(Boolean).join(' ')}
                </td>
                <td>{order.email}</td>
                <td>
                  {order.shipping?.address &&
                    Object.values(order.shipping.address)
                      .filter(Boolean)
                      .join(', ')}
                </td>
                <td>{order.items.map((item) => item.title).join(', ')}</td>
                <td>{order.total}</td>
                <td style={{ padding: 0 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditDialogOpen(true)
                      setEditedItem(order)
                    }}
                    icon={<EditIcon />}
                    $iconSize="sm"
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
