import { useEffect, useRef } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { toast } from 'react-hot-toast'
import { Navigate, useLocation } from 'react-router'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { orderSelector } from '@/store'
import { InfoDialog } from '@/components'
import { useAppSelector } from '@/hooks'
import { paymentSessionKey, stripeKey } from '@/constants'
import { handleError } from '@/errors'
import { StripeElementsOptions } from '@/types'
import { StyledCheckout } from './Checkout.style'
import { AddressForm, CheckoutForm, PaymentStatus } from './components'

const stripePromise = loadStripe(stripeKey)

type LocationState = {
  showPaymentStatus?: boolean
}

export function Checkout() {
  const location = useLocation()
  const { order, orderIsLoading, orderRetrieveError } =
    useAppSelector(orderSelector)
  const ref = useRef<HTMLDialogElement>(null)

  const state = location.state as LocationState | null
  const showPaymentStatus = state?.showPaymentStatus ?? false

  const paymentSession =
    order?.paymentSession ?? sessionStorage.getItem(paymentSessionKey) ?? ''

  useEffect(() => {
    if (orderIsLoading || orderRetrieveError) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [orderIsLoading, orderRetrieveError])

  const handleStripeError = ({ error }: FallbackProps) => {
    void handleError({ error })
    sessionStorage.removeItem(paymentSessionKey)
    toast('No Checkout Session found. Redirecting to home page...', {
      icon: '🔄',
      id: 'no-checkout-session',
    })
    return <Navigate to={'/'} replace />
  }

  const options: StripeElementsOptions = {
    clientSecret: paymentSession,
    appearance: { theme: 'flat', variables: {} },
    loader: 'auto',
  }

  if (orderIsLoading) {
    return (
      <StyledCheckout>
        <InfoDialog dialogRef={ref} message="Loading your checkout" />
      </StyledCheckout>
    )
  }

  if (orderRetrieveError) {
    return (
      <StyledCheckout>
        <InfoDialog
          dialogRef={ref}
          message="Failed to load checkout, please try again later."
          error={orderRetrieveError}
          reloadButton
          backButton
        />
      </StyledCheckout>
    )
  }

  return (
    <StyledCheckout>
      <ErrorBoundary fallbackRender={handleStripeError}>
        <Elements stripe={stripePromise} options={options}>
          {showPaymentStatus ? (
            <PaymentStatus />
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
