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

const getAnimation = (status: PaymentIntentStatus) => {
  if (successStatuses.includes(status)) return checkmarkAnim
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

  useEffect(() => {
    orderSyncTriggeredRef.current = false
  }, [paymentId])

  useEffect(() => {
    if (!paymentId) return
    if (!successStatuses.includes(status.intent)) return
    if (orderSync || orderSyncTriggeredRef.current) return

    orderSyncTriggeredRef.current = true
    void dispatch(orderSyncAfterWebhook({ paymentId }))
  }, [dispatch, orderSync, paymentId, status.intent])

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

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie animationData={getAnimation(status.intent)} loop={false} />
      </LottieWrapper>
      <p>{status.message}</p>
      {orderSyncIsLoading && <p>Syncing your order details...</p>}
      {orderSyncError && <p>{orderSyncError}</p>}
      {orderNumber && <p>Order #{orderNumber}</p>}
      {orderAmount && <p>Total: {orderAmount}</p>}
      <button onClick={() => void navigate('/')} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
