import { useEffect, useState } from 'react'
import { StyledTable } from '../Tabs/Tabs.style'
import { fetchAllOrders } from '@/store'
import { useAppDispatch } from '@/hooks'
import { Order } from '@/types'

export const Orders = () => {
  const dispatch = useAppDispatch()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    dispatch(fetchAllOrders())
      .unwrap()
      .then(setOrders)
      .catch((err) =>
        setError(typeof err === 'string' ? err : 'Failed to fetch orders'),
      )
      .finally(() => setLoading(false))
  }, [dispatch])

  return (
    <StyledTable>
      {loading && <p>Loading users...</p>}
      {error && <p>{error}</p>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
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
              order.address ??= {}

              return (
                <tr key={order.paymentId}>
                  <td>
                    <p style={{ width: 96, wordWrap: 'break-word' }}>
                      {order.paymentId}
                    </p>
                  </td>
                  <td>{order.paymentIntentStatus}</td>
                  <td>{order.orderStatus}</td>
                  <td>{order.name}</td>
                  <td>{order.email}</td>
                  <td>{Object.values(order.address).join(', ')}</td>
                  <td>{order.items.map((item) => item.title).join(', ')}</td>
                  <td>{order.total}</td>
                  <td>{order.currency}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </StyledTable>
  )
}
