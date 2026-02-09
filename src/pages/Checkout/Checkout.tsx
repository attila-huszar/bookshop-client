import { useEffect, useRef, useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { toast } from 'react-hot-toast'
import { type Location, Navigate, useLocation } from 'react-router'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { paymentSelector } from '@/store'
import { InfoDialog } from '@/components'
import { useAppSelector } from '@/hooks'
import { sessionStorageAdapter } from '@/helpers'
import { paymentSessionKey, stripeKey } from '@/constants'
import { handleError } from '@/errors'
import type { PaymentIntentShipping, StripeElementsOptions } from '@/types'
import { StyledCheckout } from './Checkout.style'
import { AddressForm, CheckoutForm, PaymentStatus } from './components'

const stripePromise = loadStripe(stripeKey)

type LocationState = {
  showPaymentStatus?: boolean
}

function StripeErrorFallback({ error }: FallbackProps) {
  useEffect(() => {
    void handleError({ error })
    sessionStorageAdapter.remove(paymentSessionKey)
    toast('No Checkout Session found. Redirecting to home page...', {
      icon: '🔄',
      id: 'no-checkout-session',
    })
  }, [error])

  return <Navigate to={'/'} replace />
}

export function Checkout() {
  const location = useLocation() as Location<LocationState | null>
  const { payment, paymentIsLoading, paymentRetrieveError } =
    useAppSelector(paymentSelector)
  const [shipping, setShipping] = useState<PaymentIntentShipping | null>(null)
  const ref = useRef<HTMLDialogElement>(null)

  const showPaymentStatus = location.state?.showPaymentStatus

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
        <InfoDialog dialogRef={ref} message="Loading your checkout" />
      </StyledCheckout>
    )
  }

  if (paymentRetrieveError) {
    return (
      <StyledCheckout>
        <InfoDialog
          dialogRef={ref}
          message="Failed to load checkout, please try again later."
          error={paymentRetrieveError}
          reloadButton
          backButton
        />
      </StyledCheckout>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret: payment?.session,
    appearance: { theme: 'stripe', variables: {} },
    loader: 'auto',
  }

  return (
    <StyledCheckout>
      <ErrorBoundary
        fallbackRender={(props) => <StripeErrorFallback {...props} />}>
        <Elements stripe={stripePromise} options={options}>
          {showPaymentStatus ? (
            <PaymentStatus />
          ) : (
            <>
              <AddressForm onAddressChange={setShipping} />
              <CheckoutForm shipping={shipping} />
            </>
          )}
        </Elements>
      </ErrorBoundary>
    </StyledCheckout>
  )
}
