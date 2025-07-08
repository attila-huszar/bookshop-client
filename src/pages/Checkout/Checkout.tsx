import { useEffect, useRef } from 'react'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from '@/constants'
import { useAppSelector } from '@/hooks'
import { orderSelector } from '@/store'
import { StyledCheckout } from './Checkout.style'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { InfoDialog } from '@/components'

export function Checkout() {
  const { order, orderIsLoading, orderRetrieveError } =
    useAppSelector(orderSelector)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (orderIsLoading || orderRetrieveError) {
      ref.current?.showModal()
    }
  }, [orderIsLoading, orderRetrieveError])

  const redirectStatus = new URLSearchParams(window.location.search).get(
    'redirect_status',
  )

  const options: StripeElementsOptions = {
    clientSecret: order?.clientSecret,
    appearance: { theme: 'flat', variables: {} },
    loader: 'auto',
  }

  function renderCheckout() {
    if (orderIsLoading) {
      return <InfoDialog dialogRef={ref} message="Loading your checkout" />
    }

    if (redirectStatus === 'succeeded') {
      return <PaymentStatus />
    }

    if (order) {
      return (
        <>
          <AddressForm />
          <CheckoutForm />
        </>
      )
    }

    return (
      <InfoDialog
        dialogRef={ref}
        message="No checkout in progress"
        error={orderRetrieveError}
        backButton
      />
    )
  }

  return (
    <StyledCheckout>
      <Elements stripe={loadStripe(stripeKey)} options={options}>
        {renderCheckout()}
      </Elements>
    </StyledCheckout>
  )
}
