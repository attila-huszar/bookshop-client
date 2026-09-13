import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Lottie } from 'lottie-react'
import { cartClear, paymentSelector, paymentSessionReset } from '@/store'
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
  const { payment } = useAppSelector(paymentSelector)
  const { status } = usePaymentStatus(payment?.paymentToken)
  const hasHandledConfirmedOrder = useRef(false)

  const isStripeSuccess = successStatuses.includes(status.intent)
  const isOrderConfirmed = isStripeSuccess

  const statusText = getCheckoutStatusMessages()

  useEffect(() => {
    if (!isOrderConfirmed) return
    if (hasHandledConfirmedOrder.current) return

    hasHandledConfirmedOrder.current = true

    dispatch(cartClear())
  }, [dispatch, isOrderConfirmed])

  const handleBackToShop = () => {
    dispatch(paymentSessionReset())
    void navigate('/')
  }

  const { animation, isLooping, primaryLine, secondaryLine } =
    getPaymentStatusView({
      status,
      statusText,
    })

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Bookshop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie src={animation} autoplay loop={isLooping} />
      </LottieWrapper>
      <p>{primaryLine}</p>
      {secondaryLine && <p>{secondaryLine}</p>}
      <button onClick={handleBackToShop} type="button">
        Back to Shop
      </button>
    </StyledPaymentStatus>
  )
}
