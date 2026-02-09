import { useState } from 'react'
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
  paymentCancel,
  paymentClear,
  paymentSelector,
  userSelector,
} from '@/store'
import { useAppDispatch, useAppSelector, usePaymentSubmit } from '@/hooks'
import { getPaymentId } from '@/helpers'
import { defaultCurrency } from '@/constants'
import type {
  PaymentIntentShipping,
  StripePaymentElementOptions,
} from '@/types'

type CheckoutFormProps = {
  shipping: PaymentIntentShipping | null
}

export function CheckoutForm({ shipping }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { payment } = useAppSelector(paymentSelector)
  const [guestEmail, setGuestEmail] = useState('')
  const receiptEmail = userData?.email ?? guestEmail
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isLoading, message, handleSubmit } = usePaymentSubmit({
    receiptEmail,
    shipping,
  })

  if (!payment) {
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

  const paymentId = getPaymentId(payment.session)

  const orderForm = {
    num: paymentId?.slice(-6).toUpperCase(),
    amount: (payment.amount / 100).toFixed(2),
  }

  const handleCancel = async () => {
    await dispatch(paymentCancel(paymentId))
    dispatch(paymentClear())
    dispatch(cartClear())
    void navigate(`/${ROUTE.CART}`, { replace: true })
  }

  const name = userData ? `${userData.firstName} ${userData.lastName}` : ''

  const address = userData?.address
    ? {
        line1: userData.address.line1 ?? '',
        line2: userData.address.line2 ?? '',
        city: userData.address.city ?? '',
        state: userData.address.state ?? '',
        postal_code: userData.address.postal_code ?? '',
        country: userData.address.country ?? '',
      }
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
        name,
        address,
        phone: userData?.phone,
      },
    },
    fields: {
      billingDetails: {
        email: userData?.email ? 'never' : 'auto',
        name: 'auto',
        phone: 'auto',
        address: 'auto',
      },
    },
    readOnly: !!userData?.email,
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
