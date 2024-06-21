import { useState, useEffect } from 'react'
import {
  loadStripe,
  StripeElementsOptionsClientSecret,
} from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from 'lib'
import { StyledCheckout } from './Checkout.styles'
import { CheckoutForm } from './components/CheckoutForm'
import { useAppSelector } from 'hooks'
import { cartSelector, userSelector } from 'store'
import { postStripePayment } from 'api/fetchData'
import { IStripePayment } from 'interfaces'

const stripePromise = loadStripe(stripeKey)

export function Checkout() {
  const { cartArray } = useAppSelector(cartSelector)
  const { userData } = useAppSelector(userSelector)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const paymentData: IStripePayment = {
      items: cartArray.map((item) => item.price * item.quantity * 100),
      currency: 'usd',
      receipt_email: userData?.email,
      description: 'Book Shop order',
      shipping: {
        address: {
          city: userData?.address.city,
          country: userData?.address.country,
          line1: userData?.address.street,
          line2: userData?.address.number,
          postal_code: userData?.address.postCode,
          state: userData?.address.state,
        },
        name: `${userData?.firstName} ${userData?.lastName}`,
        phone: userData?.phone,
      },
    }

    if (paymentData.items.length) {
      postStripePayment(paymentData).then((response) =>
        setClientSecret(response.clientSecret),
      )
    }
  }, [cartArray, userData])

  const appearance: { theme: 'stripe' | 'night' | 'flat' | undefined } = {
    theme: 'stripe',
  }

  const options: StripeElementsOptionsClientSecret = {
    clientSecret,
    appearance,
  }

  return (
    <StyledCheckout>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </StyledCheckout>
  )
}
