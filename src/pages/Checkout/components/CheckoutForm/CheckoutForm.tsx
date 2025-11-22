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
import { ROUTE } from '@/routes'
import { baseURL } from '@/constants'
import { handleError } from '@/errors'
import { toast } from 'react-hot-toast'

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
      setMessage('Payment system is not ready. Please wait a moment and try again.')
      return
    }

    if (!order?.paymentId) {
      setMessage('Order information is missing. Please start checkout again.')
      return
    }

    // Validate email
    const email = emailInput || userData?.email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    setMessage(undefined)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: email,
          return_url: `${baseURL}/${ROUTE.CHECKOUT}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'Payment validation failed.')
        } else if (error.type === 'rate_limit_error') {
          setMessage('Too many requests. Please try again in a moment.')
        } else {
          setMessage(
            error.message || 'An unexpected error occurred. Please try again.',
          )
        }
      } else {
        // Payment succeeded, will redirect via return_url
        setMessage('Payment successful! Redirecting...')
      }
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: 'Failed to process payment. Please try again.',
      })
      setMessage(formattedError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!order?.paymentId) {
      dispatch(orderClear())
      void navigate(`/${ROUTE.CART}`, { replace: true })
      return
    }

    try {
      const result = await dispatch(orderCancel(order.paymentId))
      
      if (orderCancel.rejected.match(result)) {
        const errorMessage = result.error?.message || 'Failed to cancel order'
        toast.error(errorMessage, { id: 'cancel-error' })
        // Still clear and navigate even if cancel fails on server
      }
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: 'Error canceling order',
      })
      toast.error(formattedError.message, { id: 'cancel-error' })
    } finally {
      dispatch(orderClear())
      try {
        await navigate(`/${ROUTE.CART}`, { replace: true })
      } catch (navError) {
        // Fallback if navigation fails
        window.location.href = `/${ROUTE.CART}`
      }
    }
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

  if (!orderForm) {
    return (
      <div>
        <p>Order information is missing. Please start checkout again.</p>
        <button
          type="button"
          onClick={() => void navigate(`/${ROUTE.CART}`, { replace: true })}
          style={{ backgroundColor: 'var(--grey)' }}>
          <span>Back to Cart</span>
        </button>
      </div>
    )
  }

  return (
    <form id="payment-form" onSubmit={(event) => void handleSubmit(event)}>
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
      <button
        type="button"
        onClick={() => void handleCancel()}
        disabled={isLoading}
        style={{ backgroundColor: 'var(--grey)' }}>
        <span>Cancel Checkout</span>
      </button>
      {message && (
        <div
          id="payment-message"
          style={{
            color: message.includes('successful') ? 'green' : 'red',
            marginTop: '1rem',
          }}>
          {message}
        </div>
      )}
    </form>
  )
}
