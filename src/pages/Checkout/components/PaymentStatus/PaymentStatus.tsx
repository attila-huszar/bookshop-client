import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type NavigateOptions, useNavigate } from 'react-router'
import { Lottie } from 'lottie-react'
import { ROUTE } from '@/routes/route'
import { cartClear } from '@/store/slices/cart'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import { resetCheckout } from '@/services/checkout'
import {
  isSuccessPaymentIntentStatus,
  paymentStatusEmoji,
} from '@/helpers/checkout'
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
  const { type } = status
  const handledPaymentId = useRef<string | null>(null)
  const paymentId = payment?.paymentId

  const isStripeSuccess = isSuccessPaymentIntentStatus(type)

  useEffect(() => {
    if (
      !isStripeSuccess ||
      !paymentId ||
      handledPaymentId.current === paymentId
    ) {
      return
    }

    handledPaymentId.current = paymentId

    dispatch(cartClear())
  }, [dispatch, isStripeSuccess, paymentId])

  const leaveCheckout = (path: string, options?: NavigateOptions) => {
    dispatch(resetCheckout())
    void navigate(path, options)
  }

  const canReturnToCart =
    type === 'requires_payment_method' || type === 'canceled'
  const canRetryStatus = type === 'failure' || type === 'timeout'
  const canReturnToCheckout =
    type === 'requires_action' || type === 'requires_confirmation'

  const messageKey = isStripeSuccess
    ? 'paymentReceived'
    : type === 'failure'
      ? 'fetchFailed'
      : type

  const primaryLine = t(
    `payment.status.${messageKey}`,
    status.type === 'failure'
      ? { details: status.details || t('common.unknownError') }
      : status,
  )

  const isPending = !isStripeSuccess && !canReturnToCart && !canReturnToCheckout
  const animation = isStripeSuccess
    ? checkmarkAnim
    : isPending
      ? clockAnim
      : exclamationAnim

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="Bookshop" />
        <h1>Bookshop</h1>
      </Logo>
      <LottieWrapper>
        <Lottie src={animation} autoplay loop={isPending} />
      </LottieWrapper>
      <p>
        <span aria-hidden="true">{paymentStatusEmoji[type]}</span> {primaryLine}
      </p>
      {canRetryStatus && (
        <button onClick={retry} type="button">
          {t('payment.actions.checkAgain')}
        </button>
      )}
      {canReturnToCheckout && (
        <button
          onClick={() => void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })}
          type="button">
          {t('payment.actions.returnToCheckout')}
        </button>
      )}
      {canReturnToCart && (
        <button
          onClick={() => leaveCheckout(`/${ROUTE.CART}`, { replace: true })}
          type="button">
          {t('common.actions.backToCart')}
        </button>
      )}
      {(canReturnToCart || isStripeSuccess) && (
        <button onClick={() => leaveCheckout('/')} type="button">
          {t('common.actions.backToShop')}
        </button>
      )}
    </StyledPaymentStatus>
  )
}
