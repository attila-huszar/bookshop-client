import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Lottie, { type LottieOptions } from 'lottie-react'
import {
  cartClear,
  orderSyncAfterWebhook,
  paymentSelector,
  paymentSessionReset,
} from '@/store'
import { useAppDispatch, useAppSelector, usePaymentStatus } from '@/hooks'
import { OrderSyncResponse, PaymentIntentStatus } from '@/types'
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

const getPaymentDisplayProps = (
  orderSync: OrderSyncResponse | null,
  orderSyncError: string | null,
  intent: PaymentIntentStatus,
  statusMessage: string,
) => {
  const isOrderConfirmed = Boolean(orderSync)
  const isStripeSuccess = successStatuses.includes(intent)

  const errorStr = (orderSyncError ?? '').toLowerCase()
  const hasSyncTimeout = errorStr.includes('timed out')
  const hasHardSyncError = Boolean(orderSyncError) && !hasSyncTimeout
  const isWarning = warningStatuses.includes(intent)

  if (isOrderConfirmed) {
    return {
      animation: checkmarkAnim,
      isLooping: false,
      primaryMsg: 'Order confirmed. A confirmation email is on the way.',
      secondaryMsg: null,
    }
  }

  if (isStripeSuccess) {
    let secondaryMsg =
      'This usually takes only a few seconds. You can safely leave this page.'
    let animation: LottieOptions['animationData'] = clockAnim
    let isLooping = true

    if (hasSyncTimeout) {
      secondaryMsg =
        'Still processing in the background. You can leave this page and check back shortly.'
    } else if (hasHardSyncError) {
      secondaryMsg =
        'We are still processing your order details in the background. You can leave this page and check back in a moment.'
      animation = exclamationAnim
      isLooping = false
    }

    return {
      animation,
      isLooping,
      primaryMsg: 'Payment received. We are finalizing your order details now.',
      secondaryMsg,
    }
  }

  return {
    animation: isWarning ? exclamationAnim : clockAnim,
    isLooping: !isWarning,
    primaryMsg: statusMessage,
    secondaryMsg: null,
  }
}

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { payment, orderSyncIsLoading, orderSyncError, orderSync } =
    useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.paymentToken)
  const lastSyncedPaymentId = useRef<string | null>(null)

  const paymentId = payment?.paymentId
  const isStripeSuccess = successStatuses.includes(status.intent)
  const isOrderConfirmed = Boolean(orderSync)

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

  const { animation, isLooping, primaryMsg, secondaryMsg } =
    getPaymentDisplayProps(
      orderSync,
      orderSyncError,
      status.intent,
      status.message,
    )

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie animationData={animation} loop={isLooping} />
      </LottieWrapper>
      <p>{primaryMsg}</p>
      {isStripeSuccess && !isOrderConfirmed && orderSyncIsLoading && (
        <p>Preparing your order confirmation...</p>
      )}
      {secondaryMsg && <p>{secondaryMsg}</p>}
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
