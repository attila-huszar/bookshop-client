import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js'
import { StripePaymentElementOptions } from '@stripe/stripe-js'
import { useAppSelector } from 'hooks'
import { userSelector } from 'store'
import { PATH, URL } from 'lib'

export function CheckoutForm({
  amount,
  currency,
  orderNum,
}: {
  amount: number
  currency: string
  orderNum: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const [message, setMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: userData ? userData.email : emailInput,
        return_url: `${URL.base}/${PATH.checkout}`,
      },
    })

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    defaultValues: {
      billingDetails: {
        name: userData ? `${userData.firstName} ${userData.lastName}` : '',
        email: userData ? userData.email : '',
        address: {
          country: userData?.address?.country || '',
          postal_code: userData?.address?.postal_code || '',
          state: userData?.address?.state || '',
          city: userData?.address?.city || '',
          line1: userData?.address?.line1 || '',
          line2: userData?.address?.line2 || '',
        },
      },
    },
    business: {
      name: 'Book Shop',
    },
    terms: {
      card: 'auto',
      googlePay: 'auto',
      paypal: 'auto',
    },
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div>
        <p>Order #{orderNum}</p>
        <span>
          {amount.toFixed(2)} {currency.toUpperCase()}
        </span>
      </div>
      <LinkAuthenticationElement
        options={{ defaultValues: { email: userData?.email || '' } }}
        onChange={(e) => setEmailInput(e.value.email)}
      />
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            `Pay ${amount.toFixed(2)} ${currency.toUpperCase()}`
          )}
        </span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
