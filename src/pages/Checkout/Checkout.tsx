import { useEffect, useRef, useState, useMemo } from 'react'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from '@/constants'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { orderSelector, orderRetrieve } from '@/store'
import { StyledCheckout } from './Checkout.style'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { InfoDialog } from '@/components/InfoDialog/InfoDialog'
import { handleError } from '@/errors'

export function Checkout() {
  const { order, orderIsLoading, orderRetrieveError } =
    useAppSelector(orderSelector)
  const dispatch = useAppDispatch()
  const ref = useRef<HTMLDialogElement>(null)
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null)

  const stripePromise = useMemo(() => {
    if (!stripeKey) return null
    try {
      return loadStripe(stripeKey)
    } catch {
      return null
    }
  }, [])

  const stripeError = useMemo(() => {
    if (!stripeKey) {
      return 'Stripe configuration is missing. Please contact support.'
    }
    if (!stripePromise) {
      return 'Failed to initialize payment system.'
    }
    return stripeLoadError
  }, [stripePromise, stripeLoadError])

  // Handle Stripe loading errors
  useEffect(() => {
    if (!stripePromise) return

    stripePromise.catch(async (error) => {
      const formattedError = await handleError({
        error,
        message: 'Failed to load payment system. Please try again later.',
      })
      setStripeLoadError(formattedError.message)
    })
  }, [stripePromise])

  // Show dialog for loading/errors
  useEffect(() => {
    if (orderIsLoading || orderRetrieveError || stripeError) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [orderIsLoading, orderRetrieveError, stripeError])

  // Try to retrieve order from URL if not in state
  useEffect(() => {
    const paymentId = new URLSearchParams(window.location.search).get(
      'payment_intent',
    )
    if (!order && !orderIsLoading && paymentId && !orderRetrieveError) {
      void dispatch(orderRetrieve(paymentId))
    }
  }, [order, orderIsLoading, orderRetrieveError, dispatch])

  const redirectStatus = new URLSearchParams(window.location.search).get(
    'redirect_status',
  )

  const options: StripeElementsOptions = {
    clientSecret: order?.clientSecret,
    appearance: { theme: 'flat', variables: {} },
    loader: 'auto',
  }

  function renderCheckout() {
    if (stripeError) {
      return (
        <InfoDialog
          dialogRef={ref}
          message="Payment system error"
          error={stripeError}
          reloadButton
          backButton
        />
      )
    }

    if (orderIsLoading) {
      return <InfoDialog dialogRef={ref} message="Loading your checkout" />
    }

    if (orderRetrieveError) {
      return (
        <InfoDialog
          dialogRef={ref}
          message="Failed to load checkout"
          error={orderRetrieveError}
          reloadButton
          backButton
        />
      )
    }

    if (redirectStatus === 'succeeded') {
      return <PaymentStatus />
    }

    if (order?.clientSecret) {
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

  // Don't render Elements if Stripe failed to load
  if (stripeError || stripePromise === null) {
    return <StyledCheckout>{renderCheckout()}</StyledCheckout>
  }

  return (
    <StyledCheckout>
      <Elements stripe={stripePromise} options={options}>
        {renderCheckout()}
      </Elements>
    </StyledCheckout>
  )
}
