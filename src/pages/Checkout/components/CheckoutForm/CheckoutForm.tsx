import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js'
import { type StripePaymentElementOptions } from '@stripe/stripe-js'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { orderClear, orderSelector, userSelector } from '@/store'
import { baseURL, PATH } from '@/constants'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { orderStatus } = useAppSelector(orderSelector)
  const [message, setMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: emailInput || userData?.email,
        return_url: `${baseURL}/${PATH.CLIENT.checkout}`,
      },
    })

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    if (orderStatus) {
      //void getStripePaymentCancel(orderStatus.paymentId)
    }

    dispatch(orderClear())
    navigate(`/${PATH.CLIENT.cart}`, { replace: true })
  }

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    business: {
      name: 'Book Shop',
    },
    terms: {
      card: 'auto',
      googlePay: 'auto',
      paypal: 'auto',
    },
  }

  const order = orderStatus && {
    num: orderStatus.paymentId.slice(-6).toUpperCase(),
    amount: (orderStatus.amount / 100).toFixed(2),
    currency: orderStatus.currency.toUpperCase(),
  }

  return (
    <form id="payment-form" onSubmit={(event) => void handleSubmit(event)}>
      {order && (
        <>
          <div>
            <p>Order #{order.num}</p>
            <span>
              {order.amount} {order.currency}
            </span>
          </div>
          <LinkAuthenticationElement
            options={{ defaultValues: { email: userData?.email ?? '' } }}
            onChange={(e) => setEmailInput(e.value.email)}
          />
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
          />
          <button disabled={isLoading || !stripe || !elements} id="submit">
            <span id="button-text">
              {isLoading ? (
                <div className="spinner" id="spinner"></div>
              ) : (
                `Pay ${order.amount} ${order.currency}`
              )}
            </span>
          </button>
          <div style={{ marginBottom: '1rem' }}></div>
        </>
      )}
      <button
        type="button"
        onClick={handleCancel}
        style={{ backgroundColor: 'var(--grey)' }}>
        <span id="button-text">Cancel Checkout</span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
