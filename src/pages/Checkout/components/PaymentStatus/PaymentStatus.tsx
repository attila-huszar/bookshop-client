import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import Lottie from 'lottie-react'
import {
  cartClear,
  orderSyncAfterWebhook,
  paymentSelector,
  paymentSessionReset,
} from '@/store'
import { useAppDispatch, useAppSelector, usePaymentStatus } from '@/hooks'
import { getPaymentId } from '@/helpers'
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
  const { payment, orderSyncIsLoading, orderSyncError, orderSyncResult } =
    useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.session)
  const orderSyncTriggeredRef = useRef(false)

  const paymentId = useMemo(
    () => getPaymentId(payment?.session),
    [payment?.session],
  )

  useEffect(() => {
    orderSyncTriggeredRef.current = false
  }, [paymentId])

  useEffect(() => {
    if (!paymentId) return
    if (!successStatuses.includes(status.intent)) return
    if (orderSyncResult || orderSyncTriggeredRef.current) return

    orderSyncTriggeredRef.current = true
    void dispatch(orderSyncAfterWebhook(paymentId))
  }, [dispatch, orderSyncResult, paymentId, status.intent])

  useEffect(() => {
    if (orderSyncResult) {
      dispatch(cartClear())
      dispatch(paymentSessionReset())
    }
  }, [dispatch, orderSyncResult])

  const orderNumber = orderSyncResult?.paymentId.slice(-6).toUpperCase()
  const orderAmount = orderSyncResult
    ? `${(orderSyncResult.amount / 100).toFixed(2)} ${orderSyncResult.currency}`
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
