import { useState, useEffect, useMemo } from 'react'
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from 'lib'
import { StyledCheckout } from './Checkout.styles'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { useAppSelector } from 'hooks'
import { cartSelector } from 'store'
import { postStripePayment } from 'api/fetchData'
import { ICart, IStripePayment } from 'interfaces'

const stripePromise = loadStripe(stripeKey)

const calculateTotalAmount = (cartArray: ICart[]): number => {
  return cartArray.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )
}

const createPaymentData = (
  amount: number,
  currency: string,
): IStripePayment => {
  return {
    amount: Math.round(amount * 100),
    currency,
    description: 'Book Shop Order',
  }
}

export function Checkout() {
  const { cartArray } = useAppSelector(cartSelector)
  const [clientSecret, setClientSecret] = useState('')
  const [amount, setAmount] = useState(0)
  const [currency] = useState('usd')

  const paymentResponse = useMemo(
    () => new URLSearchParams(window.location.search).get('redirect_status'),
    [],
  )

  const orderNum = useMemo(() => crypto.randomUUID().split('-')[1], [])

  useEffect(() => {
    if (cartArray.length) {
      const total = calculateTotalAmount(cartArray)

      setAmount(total)

      const paymentData = createPaymentData(total, currency)

      postStripePayment(paymentData).then((response) =>
        setClientSecret(response.clientSecret),
      )
    }
  }, [cartArray, currency])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  }

  return (
    <StyledCheckout>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise} key={clientSecret}>
          {paymentResponse === 'succeeded' ? (
            <PaymentStatus />
          ) : (
            <>
              <AddressForm />
              <CheckoutForm
                amount={amount}
                currency={currency}
                orderNum={orderNum || ''}
              />
            </>
          )}
        </Elements>
      )}
    </StyledCheckout>
  )
}
