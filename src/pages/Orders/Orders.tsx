import { ordersSelector, userSelector } from '@/store'
import { Alert, Loading } from '@/components'
import { useAppSelector } from '@/hooks'
import { formatDate, formatPaymentStatus, getPaidAtStatus } from '@/helpers'
import { defaultCurrency } from '@/constants'
import { imagePlaceholder } from '@/assets/svg'
import {
  OrderCard,
  OrderHeader,
  OrderItem,
  OrderItemImage,
  OrderItemInfo,
  OrderItemQuantityTag,
  OrderItems,
  OrderItemTitle,
  OrderMeta,
  OrdersList,
  StyledOrders,
} from './Orders.style'

const formatTotal = (amount: number, currency: string) => {
  const normalizedCurrency = (currency || defaultCurrency).toUpperCase()
  return `${amount.toLocaleString()} ${normalizedCurrency}`
}

export function Orders() {
  const { orders, ordersIsLoading, ordersError } =
    useAppSelector(ordersSelector)
  const { userData } = useAppSelector(userSelector)

  if (ordersIsLoading) {
    return <Loading message="Loading your orders" />
  }

  if (ordersError) {
    return (
      <StyledOrders>
        <h2>Recent Orders</h2>
        <Alert message="Failed to load your orders." error={ordersError} />
      </StyledOrders>
    )
  }

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <StyledOrders>
      <h2>
        {userData?.firstName ? `${userData.firstName}'s` : 'Your'} Recent Orders
      </h2>
      {sortedOrders.length === 0 ? (
        <Alert type="info" message="You have no orders yet." />
      ) : (
        <OrdersList>
          {sortedOrders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <h4>Order #{order.id}</h4>
                <p>Placed: {formatDate(order.createdAt)}</p>
              </OrderHeader>
              <OrderMeta>
                <p>
                  <span>Status:</span>{' '}
                  {formatPaymentStatus(order.paymentStatus)}
                </p>
                <p>
                  <span>Total:</span> {formatTotal(order.total, order.currency)}
                </p>
                <p>
                  <span>Paid At:</span> {getPaidAtStatus(order)}
                </p>
                <p>
                  <span>Payment ID:</span> {order.paymentId}
                </p>
              </OrderMeta>
              <OrderItems>
                {order.items.map((item) => (
                  <OrderItem key={item.id}>
                    <OrderItemInfo>
                      <OrderItemImage
                        src={item.imgUrl || imagePlaceholder}
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            imagePlaceholder)
                        }
                        alt={item.title}
                      />
                      <OrderItemTitle>
                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                        {item.author ? (
                          <span>
                            <span style={{ fontStyle: 'italic' }}>by</span>{' '}
                            {item.author}
                          </span>
                        ) : null}
                        <OrderItemQuantityTag>
                          x {item.quantity}
                        </OrderItemQuantityTag>
                      </OrderItemTitle>
                    </OrderItemInfo>
                    <p>{formatTotal(item.price, order.currency)}</p>
                  </OrderItem>
                ))}
              </OrderItems>
            </OrderCard>
          ))}
        </OrdersList>
      )}
    </StyledOrders>
  )
}
