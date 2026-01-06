import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js'
import { type StripePaymentElementOptions } from '@stripe/stripe-js'
import { useAppDispatch, useAppSelector } from '@/hooks'
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
import { defaultCurrency, paymentSessionKey } from '@/constants'
import { usePaymentSubmit } from '../../hooks'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { order } = useAppSelector(orderSelector)
  const [receiptEmail, setReceiptEmail] = useState(userData?.email ?? '')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isLoading, message, handleSubmit } = usePaymentSubmit({
    receiptEmail,
  })

  useEffect(() => {
    const paymentSession = sessionStorage.getItem(paymentSessionKey)
    if (paymentSession && !order) {
      const paymentId = getPaymentId(paymentSession)
      void dispatch(orderRetrieve(paymentId))
    }
  }, [order, dispatch])

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

  const paymentId = getPaymentId(order.paymentSession)

  const orderForm = {
    num: paymentId?.slice(-6).toUpperCase(),
    amount: (order.amount / 100).toFixed(2),
  }

  const handleCancel = async () => {
    await dispatch(orderCancel(paymentId))
    dispatch(orderClear())
    dispatch(cartClear())
    void navigate(`/${ROUTE.CART}`, { replace: true })
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
    <form id="payment-form" onSubmit={(e) => void handleSubmit(e)}>
      <div>
        <p>Order #{orderForm.num}</p>
        <span>
          {orderForm.amount} {defaultCurrency}
        </span>
      </div>
      {!userData?.email && (
        <LinkAuthenticationElement
          options={{ defaultValues: { email: receiptEmail } }}
          onChange={(e) => setReceiptEmail(e.value.email)}
        />
      )}
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
