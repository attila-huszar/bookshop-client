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
import { getPaymentStatusView, successStatuses } from './PaymentStatus.helpers'
import { Logo, LottieWrapper, StyledPaymentStatus } from './PaymentStatus.style'

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { getCheckoutStatusMessages } = useMessages()
  const { payment, orderSyncAttempt, orderSyncIssueCode, orderSync } =
    useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.paymentToken)
  const lastSyncedPaymentId = useRef<string | null>(null)

  const paymentId = payment?.paymentId
  const isStripeSuccess = successStatuses.includes(status.intent)
  const syncedPaymentStatus = orderSync?.paymentStatus ?? null
  const isOrderConfirmed = Boolean(
    syncedPaymentStatus && successStatuses.includes(syncedPaymentStatus),
  )

  const statusText = getCheckoutStatusMessages()

  useEffect(() => {
    if (!paymentId || !isStripeSuccess || isOrderConfirmed) return
    if (lastSyncedPaymentId.current === paymentId) return

    lastSyncedPaymentId.current = paymentId
    void dispatch(orderSyncAfterWebhook({ paymentId }))
  }, [dispatch, isStripeSuccess, isOrderConfirmed, paymentId])

  useEffect(() => {
    if (isOrderConfirmed) {
      dispatch(cartClear())
      dispatch(paymentSessionReset())
    }
  }, [dispatch, isOrderConfirmed])

  const { animation, isLooping, primaryLine, secondaryLine } =
    getPaymentStatusView({
      status,
      orderSyncIssueCode,
      syncedPaymentStatus,
      orderSyncAttempt,
      statusText,
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
      <p>{primaryLine}</p>
      {secondaryLine && <p>{secondaryLine}</p>}
      <button onClick={() => void navigate('/')} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
