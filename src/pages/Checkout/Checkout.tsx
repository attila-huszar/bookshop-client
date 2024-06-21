import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentMethodMessagingElement,
} from '@stripe/react-stripe-js'
import { stripeKey } from 'lib'
import { StyledCheckout } from './Checkout.styles'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { useAppSelector } from 'hooks'
import { cartSelector, userSelector } from 'store'
import { postStripePayment } from 'api/fetchData'
import { IStripePayment } from 'interfaces'

const stripe = loadStripe(stripeKey)

export function Checkout() {
  const { cartArray } = useAppSelector(cartSelector)
  const { userData } = useAppSelector(userSelector)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const paymentData: IStripePayment = {
      items: cartArray.map(
        (item) =>
          (item.price - (item.price * item.discount) / 100) *
          item.quantity *
          100,
      ),
      currency: 'usd',
      receipt_email: userData?.email,
      description: 'Book Shop Order',
    }

    if (cartArray.length && userData) {
      postStripePayment(paymentData).then((response) =>
        setClientSecret(response.clientSecret),
      )
    }
  }, [cartArray, userData])

  const appearance: { theme: 'stripe' | 'night' | 'flat' | undefined } = {
    theme: 'stripe',
  }

  const options = {
    clientSecret,
    appearance,
    business: 'Book Shop',
  }

  return (
    <StyledCheckout>
      {clientSecret && (
        <Elements options={options} stripe={stripe}>
          <AddressForm />
          <CheckoutForm />
        </Elements>
      )}
    </StyledCheckout>
  )
}
