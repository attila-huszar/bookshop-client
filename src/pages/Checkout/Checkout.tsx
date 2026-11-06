import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { shopLanguage } from '@/i18n'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ROUTE } from '@/routes/route'
import { userSelector } from '@/store/selectors'
import { InfoDialog } from '@/components/InfoDialog'
import { Loading } from '@/components/Loading'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { resetCheckout } from '@/services/checkout'
import { log } from '@/services/logger'
import { checkoutQueryParams } from '@/helpers/checkout'
import { stripeKey } from '@/constants/envConfig'
import { uiTiming } from '@/constants/time'
import type { StripeElementsOptions } from '@/types'
import { StyledCheckout } from './Checkout.style'
import { AddressForm, CheckoutForm } from './components'

const PaymentStatus = lazy(() =>
  import('./components/PaymentStatus/PaymentStatus').then((m) => ({
    default: m.PaymentStatus,
  })),
)

const stripePromise = loadStripe(stripeKey)

function CheckoutRedirect({ message }: { message: string }) {
  const navigate = useNavigate()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const scheduleRedirect = () => {
      clearTimeout(timeoutId)

      if (document.visibilityState !== 'visible') {
        return
      }

      timeoutId = setTimeout(() => {
        void navigate(ROUTE.HOME, { replace: true })
      }, uiTiming.checkoutRedirectMs)
    }

    scheduleRedirect()
    document.addEventListener('visibilitychange', scheduleRedirect)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', scheduleRedirect)
    }
  }, [navigate])

  return <Loading message={message} fullScreen />
}

function StripeErrorFallback({ error }: FallbackProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    log.error('Stripe checkout failed', { error })
    dispatch(resetCheckout())
  }, [dispatch, error])

  return <CheckoutRedirect message={t('checkout.unavailable')} />
}

export function Checkout() {
  const { t, i18n } = useTranslation()

  const location = useLocation()
  const { userIsLoading } = useAppSelector(userSelector)
  const { payment, phase, error } = useAppSelector((state) => state.payment)
  const paymentIsLoading = phase === 'restoring'
  const paymentRetrieveError = phase === 'failed' && !payment ? error : null
  const [checkoutPaymentToken] = useState(payment?.paymentToken)
  const ref = useRef<HTMLDialogElement>(null)

  const searchParams = new URLSearchParams(location.search)
  const isStripeReturn = searchParams.has(checkoutQueryParams.redirectStatus)

  useEffect(() => {
    if (paymentIsLoading || paymentRetrieveError) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [paymentIsLoading, paymentRetrieveError])

  if (phase === 'superseded') {
    return <CheckoutRedirect message={t('checkout.changedInAnotherTab')} />
  }

  if (paymentIsLoading) {
    return (
      <StyledCheckout>
        <InfoDialog dialogRef={ref} message={t('checkout.loading')} />
      </StyledCheckout>
    )
  }

  if (paymentRetrieveError) {
    return (
      <StyledCheckout>
        <InfoDialog
          dialogRef={ref}
          message={t('checkout.error')}
          error={paymentRetrieveError}
          reloadButton
          backButton
        />
      </StyledCheckout>
    )
  }

  if (!payment && !isStripeReturn) {
    return <CheckoutRedirect message={t('checkout.unavailable')} />
  }

  if (!isStripeReturn && userIsLoading) {
    return <Loading message={t('checkout.loading')} fullScreen />
  }

  const options: StripeElementsOptions = {
    locale: shopLanguage(i18n.resolvedLanguage),
    clientSecret: checkoutPaymentToken,
    appearance: { theme: 'stripe', variables: {} },
    loader: 'auto',
  }

  return (
    <StyledCheckout>
      <ErrorBoundary
        fallbackRender={(props) => <StripeErrorFallback {...props} />}>
        <Elements stripe={stripePromise} options={options}>
          {isStripeReturn ? (
            <Suspense
              fallback={
                <Loading message={t('checkout.statusLoading')} fullScreen />
              }>
              <PaymentStatus />
            </Suspense>
          ) : (
            <>
              <AddressForm />
              <CheckoutForm />
            </>
          )}
        </Elements>
      </ErrorBoundary>
    </StyledCheckout>
  )
}
