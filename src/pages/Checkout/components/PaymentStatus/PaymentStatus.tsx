import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Lottie from 'lottie-react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { cartClear, orderClear, orderSelector } from '@/store'
import { Logo, StyledPaymentStatus, LottieWrapper } from './PaymentStatus.style'
import { usePaymentStatus } from '../../hooks'
import { paymentSessionKey } from '@/constants'
import logo from '@/assets/image/logo.png'
import clockAnim from '@/assets/animations/clock_loop.json'
import checkmarkAnim from '@/assets/animations/checkmark.json'
import exclamationAnim from '@/assets/animations/exclamation.json'

const successStatuses = ['succeeded', 'requires_capture']
const warningStatuses = [
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'canceled',
]

const getAnimation = (status: string) => {
  if (successStatuses.includes(status)) return checkmarkAnim
  if (warningStatuses.includes(status)) return exclamationAnim
  return clockAnim
}

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { order } = useAppSelector(orderSelector)

  const paymentSession =
    order?.paymentSession ?? sessionStorage.getItem(paymentSessionKey)

  const { status } = usePaymentStatus(paymentSession)

  useEffect(() => {
    if (successStatuses.includes(status.intent)) {
      dispatch(cartClear())
      dispatch(orderClear())
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
