import { useTranslation } from 'react-i18next'
import { i18n } from '@/i18n'
import { useUserOrdersQuery } from '@/store/api/ordersApi'
import { userSelector } from '@/store/selectors'
import { setOrdersCurrentPage } from '@/store/slices/orders'
import { Alert } from '@/components/Alert'
import { Loading } from '@/components/Loading'
import { Pagination } from '@/components/Pagination'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { formatPaymentStatus } from '@/helpers/checkout'
import { formatDate, getPaidAtStatus } from '@/helpers/formatDate'
import { defaultCurrency } from '@/constants/defaultValues'
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

  return `${amount.toLocaleString(i18n.resolvedLanguage ?? 'en')} ${normalizedCurrency}`
}

export function Orders() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { currentPage: selectedPage, itemsPerPage } = useAppSelector(
    (state) => state.orders,
  )

  const {
    data: orders = [],
    isLoading: ordersIsLoading,
    error: ordersError,
  } = useUserOrdersQuery(undefined, { refetchOnMountOrArgChange: true })
  const { userData } = useAppSelector(userSelector)

  if (ordersIsLoading) {
    return <Loading message={t('orders.loading')} fullScreen />
  }

  if (ordersError) {
    return (
      <StyledOrders>
        <h2>{t('orders.title')}</h2>
        <Alert message={t('orders.error')} error={ordersError} />
      </StyledOrders>
    )
  }

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / itemsPerPage))
  const currentPage = Math.min(selectedPage, totalPages)
  const pageStart = (currentPage - 1) * itemsPerPage
  const visibleOrders = sortedOrders.slice(pageStart, pageStart + itemsPerPage)

  return (
    <StyledOrders>
      <h2>
        {userData?.firstName
          ? t('orders.namedTitle', { name: userData.firstName })
          : t('orders.yourTitle')}
      </h2>
      {sortedOrders.length === 0 ? (
        <Alert type="info" message={t('orders.empty')} />
      ) : (
        <OrdersList>
          {visibleOrders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <h4>{t('checkout.order', { number: order.id })}</h4>
                <p>
                  {t('orders.placed', { date: formatDate(order.createdAt) })}
                </p>
              </OrderHeader>
              <OrderMeta>
                <p>
                  <span>{t('orders.status')}</span>{' '}
                  {order.paymentId
                    ? formatPaymentStatus(order.paymentStatus)
                    : t('orders.incomplete')}
                </p>
                <p>
                  <span>{t('cart.total')}</span>{' '}
                  {formatTotal(order.total, order.currency)}
                </p>
                <p>
                  <span>{t('orders.paidAt')}</span> {getPaidAtStatus(order)}
                </p>
                <p>
                  <span>{t('orders.paymentId')}</span>{' '}
                  {order.paymentId ?? t('orders.notLinked')}
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
                            <span style={{ fontStyle: 'italic' }}>
                              {t('common.by')}
                            </span>{' '}
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
      {sortedOrders.length > 0 && (
        <Pagination
          total={sortedOrders.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => dispatch(setOrdersCurrentPage(page))}
        />
      )}
    </StyledOrders>
  )
}
