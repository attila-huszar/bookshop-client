import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Lottie } from 'lottie-react'
import { ROUTE } from '@/routes/route'
import { cartClear } from '@/store/slices/cart'
import { paymentSessionReset } from '@/store/slices/payment'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import { isSuccessPaymentIntentStatus } from '@/helpers/checkout'
import checkmarkAnim from '@/assets/animations/checkmark.json'
import clockAnim from '@/assets/animations/clock_loop.json'
import exclamationAnim from '@/assets/animations/exclamation.json'
import logo from '@/assets/image/logo.png'
import { Logo, LottieWrapper, StyledPaymentStatus } from './PaymentStatus.style'

export function PaymentStatus() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const payment = useAppSelector((state) => state.payment.payment)
  const { status, retry } = usePaymentStatus(payment?.paymentToken)
  const hasHandledSuccessfulPayment = useRef(false)

  const isStripeSuccess = isSuccessPaymentIntentStatus(status.intent)

  useEffect(() => {
    if (!isStripeSuccess || hasHandledSuccessfulPayment.current) {
      return
    }

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

  let primaryLine = t('payment.status.checking')

  if (isSuccessPaymentIntentStatus(status.intent)) {
    primaryLine = t('payment.status.paymentReceived')
  } else if (status.messageOverride) {
    switch (status.messageOverride.type) {
      case 'retry':
        primaryLine = t('payment.status.retry', {
          attempt: status.messageOverride.attempt,
          maxRetries: status.messageOverride.maxRetries,
        })
        break

      case 'failure':
        primaryLine = t('payment.status.fetchFailed', {
          details: status.messageOverride.details || t('common.unknownError'),
        })
        break

      case 'timeout':
        primaryLine = t('payment.status.timeout', {
          timeoutSeconds: status.messageOverride.timeoutSeconds,
        })
        break
    }
  } else if (status.intent !== null) {
    primaryLine = t(`payment.status.${status.intent}`)
  }

  const isWarning = canReturnToCart || canReturnToCheckout
  const animation = isStripeSuccess
    ? checkmarkAnim
    : isWarning
      ? exclamationAnim
      : clockAnim
  const isLooping = !isStripeSuccess && !isWarning

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="Bookshop" />
        <h1>Bookshop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie src={animation} autoplay loop={isLooping} />
      </LottieWrapper>
      <p>{primaryLine}</p>
      {canRetryStatus && (
        <button onClick={retry} type="button">
          {t('payment.actions.checkAgain')}
        </button>
      )}
      {canReturnToCheckout && (
        <button onClick={handleReturnToCheckout} type="button">
          {t('payment.actions.returnToCheckout')}
        </button>
      )}
      {canReturnToCart && (
        <button onClick={handleBackToCart} type="button">
          {t('common.actions.backToCart')}
        </button>
      )}
      {(canReturnToCart || isStripeSuccess) && (
        <button onClick={handleBackToShop} type="button">
          {t('common.actions.backToShop')}
        </button>
      )}
    </StyledPaymentStatus>
  )
}
