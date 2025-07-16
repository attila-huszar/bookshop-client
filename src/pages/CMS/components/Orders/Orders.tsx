import { useOutletContext } from 'react-router'
import { StyledTable } from '../Tabs/Tabs.style'
import { Error } from '@/components'
import { cmsOrdersSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { CMSContext } from '../../CMS.types'

export const Orders = () => {
  const { orders, ordersError } = useAppSelector(cmsOrdersSelector)
  const { selectedItems, setSelectedItems } = useOutletContext<{
    selectedItems: CMSContext
    setSelectedItems: React.Dispatch<React.SetStateAction<CMSContext>>
  }>()

  if (ordersError) {
    return <Error message="Error loading orders" error={ordersError} />
  }

  const allSelected =
    orders.length > 0 && selectedItems.orders.length === orders.length

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
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
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
                <td>{order.name}</td>
                <td>{order.email}</td>
                <td>
                  {order.address && Object.values(order.address).join(', ')}
                </td>
                <td>{order.items.map((item) => item.title).join(', ')}</td>
                <td>{order.total}</td>
                <td>{order.currency}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
