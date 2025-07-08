import { StyledTable } from '../Tabs/Tabs.style'
import { InfoDialog } from '@/components'
import { cmsOrdersSelector } from '@/store'
import { useAppSelector } from '@/hooks'

export const Orders = () => {
  const { orders, ordersIsLoading, ordersError } =
    useAppSelector(cmsOrdersSelector)

  if (ordersIsLoading) {
    return <InfoDialog message="Loading orders..." />
  }

  if (ordersError) {
    return <InfoDialog message="Error loading orders" error={ordersError} />
  }

  return (
    <StyledTable>
      <table>
        <thead>
          <tr>
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
              <tr key={order.paymentId}>
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
