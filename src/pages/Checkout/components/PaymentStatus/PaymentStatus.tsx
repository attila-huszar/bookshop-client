import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Lottie, { type LottieOptions } from 'lottie-react'
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
import type { OrderSyncIssueCode } from '@/types/Order'
import type { PaymentIntentStatus } from '@/types/Stripe'
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

type CheckoutPrimaryMessages = ReturnType<
  ReturnType<typeof useMessages>['getCheckoutPrimaryMessage']
>
type CheckoutSecondaryMessageGetter = ReturnType<
  typeof useMessages
>['getCheckoutSecondaryMessage']

const getPaymentDisplayProps = (
  isOrderConfirmed: boolean,
  orderSyncIssueCode: OrderSyncIssueCode | null,
  syncedPaymentStatus: PaymentIntentStatus | null,
  intent: PaymentIntentStatus,
  statusMessage: string,
  primaryMessages: CheckoutPrimaryMessages,
  secondaryMessages: CheckoutSecondaryMessageGetter,
) => {
  const isStripeSuccess = successStatuses.includes(intent)

  const hasHardSyncError =
    orderSyncIssueCode !== null && orderSyncIssueCode !== 'timeout'
  const isWarning = warningStatuses.includes(intent)

  if (isOrderConfirmed) {
    return {
      animation: checkmarkAnim,
      isLooping: false,
      primaryMsg: primaryMessages.orderConfirmed,
      secondaryMsg: null,
    }
  }

  if (isStripeSuccess) {
    const secondaryMsg = secondaryMessages(
      orderSyncIssueCode,
      syncedPaymentStatus,
    )
    let animation: LottieOptions['animationData'] = clockAnim
    let isLooping = true
    let primaryMsg = primaryMessages.paymentReceived

    if (hasHardSyncError) {
      animation = exclamationAnim
      isLooping = false
    }

    if (syncedPaymentStatus === 'canceled') {
      animation = exclamationAnim
      isLooping = false
      primaryMsg = primaryMessages.paymentCanceled
    } else if (
      syncedPaymentStatus &&
      !successStatuses.includes(syncedPaymentStatus)
    ) {
      animation = exclamationAnim
      isLooping = false
      primaryMsg = statusMessage
    } else if (orderSyncIssueCode === 'unauthorized') {
      primaryMsg = primaryMessages.paymentVerificationIssue
    }

    return {
      animation,
      isLooping,
      primaryMsg,
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
  const {
    getPaymentIntentStatusMessage,
    getCheckoutPrimaryMessage: getCheckoutPaymentStatusMessages,
    getCheckoutSecondaryMessage: getCheckoutPaymentStatusSecondaryMessages,
  } = useMessages()
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
  const paymentStatusMessages = getCheckoutPaymentStatusMessages()
  const effectiveStatusMessage = syncedPaymentStatus
    ? getPaymentIntentStatusMessage(syncedPaymentStatus)
    : status.message

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
      isOrderConfirmed,
      orderSyncIssueCode,
      syncedPaymentStatus,
      status.intent,
      effectiveStatusMessage,
      paymentStatusMessages,
      getCheckoutPaymentStatusSecondaryMessages,
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
        <p>{paymentStatusMessages.syncInProgress}</p>
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
