import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Lottie from 'lottie-react'
import {
  cartClear,
  orderSyncAfterWebhook,
  paymentSelector,
  paymentSessionReset,
} from '@/store'
import {
  useAppDispatch,
  useAppSelector,
  useMessages,
  usePaymentStatus,
} from '@/hooks'
import logo from '@/assets/image/logo.png'
import {
  getEffectiveStatusLine,
  getStatusView,
  successStatuses,
} from './PaymentStatus.helpers'
import { Logo, LottieWrapper, StyledPaymentStatus } from './PaymentStatus.style'

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { getCheckoutText } = useMessages()
  const { payment, orderSyncIsLoading, orderSyncIssueCode, orderSync } =
    useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.paymentToken)
  const lastSyncedPaymentId = useRef<string | null>(null)

  const paymentId = payment?.paymentId
  const isStripeSuccess = successStatuses.includes(status.intent)
  const syncedPaymentStatus = orderSync?.paymentStatus ?? null
  const isOrderConfirmed = Boolean(
    syncedPaymentStatus && successStatuses.includes(syncedPaymentStatus),
  )
  const checkoutText = getCheckoutText()
  const statusText = checkoutText.status
  const statusDetail = statusText.detail(
    orderSyncIssueCode,
    syncedPaymentStatus,
  )
  const statusLine = getEffectiveStatusLine(
    syncedPaymentStatus,
    status,
    statusText,
  )

  useEffect(() => {
    if (
      paymentId &&
      isStripeSuccess &&
      !isOrderConfirmed &&
      lastSyncedPaymentId.current !== paymentId
    ) {
      lastSyncedPaymentId.current = paymentId
      void dispatch(orderSyncAfterWebhook({ paymentId }))
    }
  }, [dispatch, isStripeSuccess, isOrderConfirmed, paymentId])

  useEffect(() => {
    if (isOrderConfirmed) {
      dispatch(cartClear())
      dispatch(paymentSessionReset())
    }
  }, [dispatch, isOrderConfirmed])

  const { animation, isLooping, headline, detail } = getStatusView({
    isOrderConfirmed,
    orderSyncIssueCode,
    syncedPaymentStatus,
    intent: status.intent,
    statusLine,
    statusText,
    statusDetail,
  })

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie animationData={animation} loop={isLooping} />
      </LottieWrapper>
      <p>{headline}</p>
      {isStripeSuccess && !isOrderConfirmed && orderSyncIsLoading && (
        <p>{statusText.syncingOrder}</p>
      )}
      {detail && <p>{detail}</p>}
      {orderSync && (
        <>
          <p>Order #{orderSync.paymentId.slice(-6).toUpperCase()}</p>
          <p>
            Total: {(orderSync.amount / 100).toFixed(2)} {orderSync.currency}
          </p>
        </>
      )}
      <button onClick={() => void navigate('/')} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
