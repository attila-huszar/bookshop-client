import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { paymentSession, stripeKey } from '@/constants'
import { useAppSelector } from '@/hooks'
import { orderSelector } from '@/store'
import { StyledCheckout } from './Checkout.style'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { InfoDialog } from '@/components/InfoDialog/InfoDialog'
import { handleError } from '@/errors'

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

  const clientSecret =
    order?.clientSecret ?? sessionStorage.getItem(paymentSession) ?? ''

  useEffect(() => {
    if (orderIsLoading || orderRetrieveError) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [orderIsLoading, orderRetrieveError])

  const handleStripeError = ({ error }: FallbackProps) => {
    void handleError({ error })
    sessionStorage.removeItem(paymentSession)
    toast('No Checkout Session found. Redirecting to home page...', {
      icon: '🔄',
      id: 'no-checkout-session',
    })
    return <Navigate to={'/'} replace />
  }

  const options: StripeElementsOptions = {
    clientSecret,
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
