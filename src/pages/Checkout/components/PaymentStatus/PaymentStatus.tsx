import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Lottie from 'lottie-react'
import {
  cartClear,
  orderSyncAfterWebhook,
  paymentSelector,
  paymentSessionReset,
} from '@/store'
import { useAppDispatch, useAppSelector, usePaymentStatus } from '@/hooks'
import { PaymentIntentStatus } from '@/types'
import checkmarkAnim from '@/assets/animations/checkmark.json'
import clockAnim from '@/assets/animations/clock_loop.json'
import exclamationAnim from '@/assets/animations/exclamation.json'
import logo from '@/assets/image/logo.png'
import { Logo, LottieWrapper, StyledPaymentStatus } from './PaymentStatus.style'

const successStatuses: PaymentIntentStatus[] = ['succeeded', 'requires_capture']
const warningStatuses: PaymentIntentStatus[] = [
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'canceled',
]

const getAnimation = ({
  isOrderConfirmed,
  hasSyncTimeout,
  hasHardSyncError,
  status,
}: {
  isOrderConfirmed: boolean
  hasSyncTimeout: boolean
  hasHardSyncError: boolean
  status: PaymentIntentStatus
}) => {
  if (isOrderConfirmed) return checkmarkAnim
  if (hasHardSyncError && !hasSyncTimeout) return exclamationAnim
  if (warningStatuses.includes(status)) return exclamationAnim
  return clockAnim
}

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { payment, orderSyncIsLoading, orderSyncError, orderSync } =
    useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.paymentToken)
  const orderSyncTriggeredRef = useRef(false)

  const paymentId = payment?.paymentId
  const isStripeSuccess = successStatuses.includes(status.intent)
  const isOrderConfirmed = Boolean(orderSync)
  const hasSyncTimeout = (orderSyncError ?? '')
    .toLowerCase()
    .includes('timed out')
  const hasHardSyncError = Boolean(orderSyncError) && !hasSyncTimeout

  const primaryMessage = isOrderConfirmed
    ? 'Order confirmed. A confirmation email is on the way.'
    : isStripeSuccess
      ? 'Payment received. We are finalizing your order details now.'
      : status.message

  const secondaryMessage =
    isStripeSuccess && !isOrderConfirmed
      ? hasSyncTimeout
        ? 'Still processing in the background. Please check back shortly or refresh this page.'
        : hasHardSyncError
          ? 'We are still processing your order details. Please refresh in a moment.'
          : 'This usually takes only a few seconds.'
      : null

  useEffect(() => {
    orderSyncTriggeredRef.current = false
  }, [paymentId])

  useEffect(() => {
    if (!paymentId) return
    if (!isStripeSuccess) return
    if (orderSync || orderSyncTriggeredRef.current) return

    orderSyncTriggeredRef.current = true
    void dispatch(orderSyncAfterWebhook({ paymentId }))
  }, [dispatch, isStripeSuccess, orderSync, paymentId])

  useEffect(() => {
    if (orderSync) {
      dispatch(cartClear())
      dispatch(paymentSessionReset())
    }
  }, [dispatch, orderSync])

  const orderNumber = orderSync?.paymentId.slice(-6).toUpperCase()
  const orderAmount = orderSync
    ? `${(orderSync.amount / 100).toFixed(2)} ${orderSync.currency}`
    : null
  const isPendingAnimation =
    !isOrderConfirmed &&
    !(hasHardSyncError && !hasSyncTimeout) &&
    !warningStatuses.includes(status.intent)
  const animationData = getAnimation({
    isOrderConfirmed,
    hasSyncTimeout,
    hasHardSyncError,
    status: status.intent,
  })

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie animationData={animationData} loop={isPendingAnimation} />
      </LottieWrapper>
      <p>{primaryMessage}</p>
      {isStripeSuccess && !isOrderConfirmed && orderSyncIsLoading && (
        <p>Preparing your order confirmation...</p>
      )}
      {secondaryMessage && <p>{secondaryMessage}</p>}
      {orderNumber && <p>Order #{orderNumber}</p>}
      {orderAmount && <p>Total: {orderAmount}</p>}
      <button onClick={() => void navigate('/')} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
