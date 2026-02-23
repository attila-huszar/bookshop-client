import { useState } from 'react'
import { toast } from 'react-hot-toast'
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
  paymentSelector,
  paymentStateReset,
  userSelector,
} from '@/store'
import { useAppDispatch, useAppSelector, usePaymentSubmit } from '@/hooks'
import { defaultCurrency } from '@/constants'
import type { StripePaymentElementOptions } from '@/types'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const { payment } = useAppSelector(paymentSelector)
  const [linkEmail, setLinkEmail] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const receiptEmail = (userData?.email ?? linkEmail).trim()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    handleSubmit,
    retryPayment,
    canRetry,
    message,
    setMessage,
    isLoading,
  } = usePaymentSubmit(receiptEmail)

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

  const paymentId = payment.paymentId

  const orderForm = {
    num: paymentId?.slice(-6).toUpperCase(),
    amount: (payment.amount / 100).toFixed(2),
  }

  const handleCancel = async () => {
    setCancelError(null)

    if (!paymentId) {
      const errorMessage =
        'Unable to cancel checkout right now: missing payment ID.'
      setCancelError(errorMessage)
      toast.error(errorMessage, { id: 'checkout-cancel-error' })
      return
    }

    setIsCanceling(true)

    try {
      await dispatch(paymentCancel({ paymentId })).unwrap()
      dispatch(paymentStateReset())
      dispatch(cartClear())
      void navigate(`/${ROUTE.CART}`, { replace: true })
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to cancel checkout right now. Please try again.'

      setCancelError(errorMessage)
      toast.error(errorMessage, { id: 'checkout-cancel-error' })
    } finally {
      setIsCanceling(false)
    }
  }

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'accordion',
    business: {
      name: 'Bookshop',
    },
    fields: {
      billingDetails: {
        email: 'never',
      },
    },
  }

  return (
    <form
      className="stripe-form"
      id="payment-form"
      onSubmit={(e) => {
        setCancelError(null)
        void handleSubmit(e)
      }}>
      <div>
        <p>Order #{orderForm.num}</p>
        <span>
          {orderForm.amount} {defaultCurrency}
        </span>
      </div>
      {!userData?.email && (
        <LinkAuthenticationElement
          options={{ defaultValues: { email: linkEmail } }}
          onChange={(e) => {
            setLinkEmail(e.value.email)
            setMessage(null)
            setCancelError(null)
          }}
        />
      )}
      <PaymentElement
        id="payment-element"
        options={paymentElementOptions}
        onChange={() => {
          setMessage(null)
          setCancelError(null)
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        id="submit">
        <span>
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            `${canRetry && message ? 'Retry Payment' : 'Pay'} ${orderForm.amount} ${defaultCurrency}`
          )}
        </span>
      </button>
      {canRetry && message && (
        <>
          <div style={{ marginBottom: '1rem' }}></div>
          <button
            type="button"
            onClick={() => void retryPayment()}
            disabled={isLoading || !stripe || !elements}
            style={{ backgroundColor: 'var(--mid-grey)' }}>
            <span>Retry Payment Now</span>
          </button>
        </>
      )}
      <div style={{ marginBottom: '1rem' }}></div>
      <button
        type="button"
        onClick={() => void handleCancel()}
        disabled={isLoading || isCanceling}
        style={{ backgroundColor: 'var(--grey)' }}>
        <span>
          {isCanceling
            ? 'Canceling checkout...'
            : cancelError
              ? 'Retry Cancel Checkout'
              : 'Cancel Checkout'}
        </span>
      </button>
      {cancelError && (
        <div id="cancel-message" style={{ marginTop: '1rem' }}>
          {cancelError}
        </div>
      )}
      {message && (
        <div id="payment-message" style={{ marginTop: '1rem' }}>
          {message}
        </div>
      )}
    </form>
  )
}
