import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes'
import {
  cartClear,
  orderCancel,
  orderClear,
  orderRetrieve,
  orderSelector,
  userSelector,
} from '@/store'
import { useAppDispatch, useAppSelector, usePaymentSubmit } from '@/hooks'
import { getPaymentId } from '@/helpers'
import { defaultCurrency, paymentSessionKey } from '@/constants'
import { StripePaymentElementOptions } from '@/types'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { order } = useAppSelector(orderSelector)
  const [guestEmail, setGuestEmail] = useState('')
  const receiptEmail = userData?.email ?? guestEmail
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

  const billingName = userData
    ? `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() ||
      undefined
    : undefined

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'accordion',
    business: {
      name: 'Bookshop',
    },
    terms: {
      card: 'auto',
      googlePay: 'auto',
      paypal: 'auto',
    },
    defaultValues: {
      billingDetails: {
        email: receiptEmail,
        name: billingName,
        phone: userData?.phone,
        address: userData?.address,
      },
    },
    fields: {
      billingDetails: {
        email: userData?.email ? 'never' : 'auto',
        name: userData?.email ? 'never' : 'auto',
        phone: 'auto',
        address: 'auto',
      },
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
          onChange={(e) => setGuestEmail(e.value.email)}
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
