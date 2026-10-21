import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router'
import { i18n, shopLanguage } from '@/i18n'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from '@/components/AppToaster'
import { InfoDialog } from '@/components/InfoDialog'
import { Loading } from '@/components/Loading'
import { useAppSelector } from '@/hooks/redux'
import { log } from '@/services/logger'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { stripeKey } from '@/constants/envConfig'
import { paymentIdKey } from '@/constants/keys'
import { checkoutQueryParams } from '@/constants/payments'
import type { StripeElementsOptions } from '@/types'
import { StyledCheckout } from './Checkout.style'
import { AddressForm, CheckoutForm } from './components'

const PaymentStatus = lazy(() =>
  import('./components/PaymentStatus/PaymentStatus').then((m) => ({
    default: m.PaymentStatus,
  })),
)

const stripePromise = loadStripe(stripeKey)

function StripeErrorFallback({ error }: FallbackProps) {
  useEffect(() => {
    log.error('Stripe checkout failed', { error })
    sessionStorageAdapter.remove(paymentIdKey)
    toast(i18n.t('checkout.missingSession'), {
      icon: '🔄',
      id: 'no-checkout-session',
    })
  }, [error])

  return <Navigate to={'/'} replace />
}

export function Checkout() {
  const { t, i18n } = useTranslation()

  const location = useLocation()
  const payment = useAppSelector((state) => state.payment.payment)
  const paymentIsLoading = useAppSelector(
    (state) => state.payment.paymentIsLoading,
  )
  const paymentRetrieveError = useAppSelector(
    (state) => state.payment.paymentRetrieveError,
  )
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
