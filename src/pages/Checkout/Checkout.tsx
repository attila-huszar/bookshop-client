import { useEffect, useRef, useState } from 'react'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from '@/constants'
import { useAppSelector } from '@/hooks'
import { orderSelector } from '@/store'
import { StyledCheckout } from './Checkout.style'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { InfoDialog } from '@/components/InfoDialog/InfoDialog'
import { handleError } from '@/errors'

const stripePromise = loadStripe(stripeKey)

export function Checkout() {
  const { order, orderIsLoading, orderRetrieveError } =
    useAppSelector(orderSelector)
  const ref = useRef<HTMLDialogElement>(null)
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null)

  useEffect(() => {
    stripePromise.catch(async (error) => {
      const formattedError = await handleError({
        error,
        message: 'Failed to load payment system. Please try again later.',
      })
      setStripeLoadError(formattedError.message)
    })
  }, [])

  const redirectStatus = new URLSearchParams(window.location.search).get(
    'redirect_status',
  )

  const clientSecret = order?.clientSecret

  useEffect(() => {
    if (
      orderIsLoading ||
      orderRetrieveError ||
      stripeLoadError ||
      !clientSecret
    ) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [orderIsLoading, orderRetrieveError, stripeLoadError, clientSecret])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'flat', variables: {} },
    loader: 'auto',
  }

  if (stripeLoadError) {
    return (
      <StyledCheckout>
        <InfoDialog
          dialogRef={ref}
          message="Payment system error"
          error={stripeLoadError}
          reloadButton
          backButton
        />
      </StyledCheckout>
    )
  }

  if (clientSecret && options) {
    return (
      <StyledCheckout>
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
      </StyledCheckout>
    )
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
      <InfoDialog
        dialogRef={ref}
        message="No checkout in progress"
        error={orderRetrieveError}
        backButton
      />
    </StyledCheckout>
  )
}
