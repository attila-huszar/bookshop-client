import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Lottie from 'lottie-react'
import { cartClear, paymentClear, paymentSelector } from '@/store'
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
  const { payment } = useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.session)

  useEffect(() => {
    if (successStatuses.includes(status.intent)) {
      dispatch(cartClear())
      dispatch(paymentClear())
    }
  }, [dispatch, status.intent])

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
      <button onClick={() => void navigate('/')} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
