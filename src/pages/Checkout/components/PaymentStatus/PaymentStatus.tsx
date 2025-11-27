import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useAppDispatch, useAppSelector, useLocalStorage } from '@/hooks'
import { cartClear, orderClear, orderSelector } from '@/store'
import { Logo, StyledPaymentStatus, LottieWrapper } from './PaymentStatus.style'
import { usePaymentStatus } from '../../hooks'
import logo from '@/assets/image/logo.png'
import checkmarkAnim from '@/assets/lottie/checkmark.lottie'
import exclamationAnim from '@/assets/lottie/exclamation.lottie'

const successStatuses = ['succeeded', 'requires_capture']

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { order } = useAppSelector(orderSelector)
  const { getFromLocalStorage } = useLocalStorage()

  const clientSecret =
    order?.clientSecret ?? getFromLocalStorage<string>('clientSecret')

  const { status } = usePaymentStatus(clientSecret)

  useEffect(() => {
    if (successStatuses.includes(status.intent)) {
      dispatch(cartClear())
      dispatch(orderClear())
    }
  }, [dispatch, status.intent])

  const animation = {
    succeeded: checkmarkAnim,
    requires_capture: checkmarkAnim,
    processing: undefined,
    requires_payment_method: exclamationAnim,
    requires_confirmation: exclamationAnim,
    requires_action: exclamationAnim,
    canceled: exclamationAnim,
  }[status.intent]

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      <LottieWrapper>
        <DotLottieReact src={animation} autoplay />
      </LottieWrapper>
      <p>{status.message}</p>
      <button onClick={() => void navigate('/')} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
