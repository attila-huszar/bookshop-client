import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Lottie } from 'lottie-react'
import { ROUTE } from '@/routes'
import { cartClear, paymentSelector, paymentSessionReset } from '@/store'
import {
  useAppDispatch,
  useAppSelector,
  useMessages,
  usePaymentStatus,
} from '@/hooks'
import logo from '@/assets/image/logo.png'
import {
  getPaymentStatusView,
  isSuccessPaymentIntentStatus,
} from './PaymentStatus.helpers'
import { Logo, LottieWrapper, StyledPaymentStatus } from './PaymentStatus.style'

export function PaymentStatus() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { getCheckoutStatusMessages } = useMessages()
  const { payment } = useAppSelector(paymentSelector)
  const { status, retry } = usePaymentStatus(payment?.paymentToken)
  const hasHandledSuccessfulPayment = useRef(false)

  const isStripeSuccess = isSuccessPaymentIntentStatus(status.intent)

  const statusText = getCheckoutStatusMessages()

  useEffect(() => {
    if (!isStripeSuccess) return
    if (hasHandledSuccessfulPayment.current) return

    hasHandledSuccessfulPayment.current = true

    dispatch(cartClear())
    dispatch(paymentSessionReset())
  }, [dispatch, isStripeSuccess])

  const handleBackToShop = () => {
    dispatch(paymentSessionReset())
    void navigate('/')
  }

  const handleBackToCart = () => {
    dispatch(paymentSessionReset())
    void navigate(`/${ROUTE.CART}`, { replace: true })
  }

  const canReturnToCart =
    status.intent === 'requires_payment_method' || status.intent === 'canceled'
  const canRetryStatus =
    status.messageOverride?.type === 'failure' ||
    status.messageOverride?.type === 'timeout'
  const canReturnToCheckout =
    status.intent === 'requires_action' ||
    status.intent === 'requires_confirmation'

  const handleReturnToCheckout = () => {
    void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
  }

  const { animation, isLooping, primaryLine } = getPaymentStatusView({
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
      {canRetryStatus && (
        <button onClick={retry} type="button">
          Check Payment Again
        </button>
      )}
      {canReturnToCheckout && (
        <button onClick={handleReturnToCheckout} type="button">
          Return to Checkout
        </button>
      )}
      {canReturnToCart && (
        <button onClick={handleBackToCart} type="button">
          Back to Cart
        </button>
      )}
      {(canReturnToCart || isStripeSuccess) && (
        <button onClick={handleBackToShop} type="button">
          Back to Shop
        </button>
      )}
    </StyledPaymentStatus>
  )
}
