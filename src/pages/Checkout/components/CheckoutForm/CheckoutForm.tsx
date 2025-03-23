import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js'
import { type StripePaymentElementOptions } from '@stripe/stripe-js'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { orderCancel, orderClear, orderSelector, userSelector } from '@/store'
import { baseURL, PATH } from '@/constants'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { order } = useAppSelector(orderSelector)
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

  const handleCancel = async () => {
    if (order) {
      await dispatch(orderCancel(order.paymentId))
    }

    dispatch(orderClear())
    await navigate(`/${PATH.CLIENT.cart}`, { replace: true })
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

  const orderForm = order && {
    num: order.paymentId.slice(-6).toUpperCase(),
    amount: (order.amount / 100).toFixed(2),
    currency: order.currency.toUpperCase(),
  }

  return (
    <form id="payment-form" onSubmit={(event) => void handleSubmit(event)}>
      {orderForm && (
        <>
          <div>
            <p>Order #{orderForm.num}</p>
            <span>
              {orderForm.amount} {orderForm.currency}
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
          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            id="submit">
            <span>
              {isLoading ? (
                <div className="spinner" id="spinner"></div>
              ) : (
                `Pay ${orderForm.amount} ${orderForm.currency}`
              )}
            </span>
          </button>
          <div style={{ marginBottom: '1rem' }}></div>
        </>
      )}
      <button
        type="button"
        onClick={() => void handleCancel()}
        style={{ backgroundColor: 'var(--grey)' }}>
        <span>Cancel Checkout</span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
