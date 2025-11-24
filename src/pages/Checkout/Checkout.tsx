import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from '@/constants'
import { useAppSelector, useLocalStorage } from '@/hooks'
import { orderSelector } from '@/store'
import { StyledCheckout } from './Checkout.style'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { InfoDialog } from '@/components/InfoDialog/InfoDialog'

const stripePromise = loadStripe(stripeKey)

export function Checkout() {
  const location = useLocation()
  const { order, orderIsLoading, orderRetrieveError } =
    useAppSelector(orderSelector)
  const { getFromLocalStorage } = useLocalStorage()
  const ref = useRef<HTMLDialogElement>(null)

  const redirectStatus = new URLSearchParams(location.search).get(
    'redirect_status',
  )

  const clientSecret =
    order?.clientSecret ?? getFromLocalStorage('clientSecret') ?? ''

  useEffect(() => {
    if (orderIsLoading || orderRetrieveError) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [orderIsLoading, orderRetrieveError, clientSecret])

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
          message="Failed to load checkout"
          error={orderRetrieveError}
          reloadButton
          backButton
        />
      </StyledCheckout>
    )
  }

  return (
    <StyledCheckout>
      <ErrorBoundary
        fallbackRender={() => (
          <div>
            <p>Something went wrong. Please try again later.</p>
          </div>
        )}>
        <Elements stripe={stripePromise} options={options}>
          {redirectStatus === 'succeeded' ? (
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
