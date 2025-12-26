import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js'
import { type StripePaymentElementOptions } from '@stripe/stripe-js'
import { useAppDispatch, useAppSelector, useLocalStorage } from '@/hooks'
import {
  cartClear,
  orderCancel,
  orderClear,
  orderRetrieve,
  orderSelector,
  userSelector,
} from '@/store'
import { ROUTE } from '@/routes'
import { getPaymentId } from '@/helpers'
import { defaultCurrency } from '@/constants'
import { usePaymentSubmit } from '../../hooks'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { order } = useAppSelector(orderSelector)
  const { getFromLocalStorage } = useLocalStorage()
  const [emailInput, setEmailInput] = useState('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isLoading, message, handleSubmit } = usePaymentSubmit({
    receiptEmail: userData?.email ?? emailInput,
  })

  useEffect(() => {
    const localStorageClientSecret = getFromLocalStorage<string>('clientSecret')
    if (localStorageClientSecret && !order) {
      const paymentId = getPaymentId(localStorageClientSecret)
      void dispatch(orderRetrieve(paymentId))
    }
  }, [order, dispatch, getFromLocalStorage])

  if (!order) {
    return (
      <div>
        <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
          Order information is missing. Please start checkout again.
        </p>
        <button
          type="button"
          onClick={() => void navigate(`/${ROUTE.CART}`, { replace: true })}>
          <span>Back to Cart</span>
        </button>
      </div>
    )
  }

  const paymentId = getPaymentId(order.clientSecret)

  const orderForm = {
    num: paymentId?.slice(-6).toUpperCase(),
    amount: (order.amount / 100).toFixed(2),
  }

  const handleCancel = async () => {
    try {
      await dispatch(orderCancel(paymentId)).unwrap()
    } catch {
      // Continue with cleanup even if cancel fails - thunk handles partial failures
    } finally {
      dispatch(orderClear())
      dispatch(cartClear())
      void navigate(`/${ROUTE.CART}`, { replace: true })
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

  return (
    <form id="payment-form" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <p>Order #{orderForm.num}</p>
        <span>
          {orderForm.amount} {defaultCurrency}
        </span>
      </div>
      <LinkAuthenticationElement
        options={{ defaultValues: { email: userData?.email ?? emailInput } }}
        onChange={(e) => setEmailInput(e.value.email)}
      />
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        id="submit">
        <span>
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            `Pay ${orderForm.amount} ${defaultCurrency}`
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
        <div id="payment-message" style={{ marginTop: '1rem' }}>
          {message}
        </div>
      )}
    </form>
  )
}
