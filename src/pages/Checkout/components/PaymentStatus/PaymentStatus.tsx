import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStripe } from '@stripe/react-stripe-js'
import { updateOrder } from '@/api'
import { Logo, Status, StyledPaymentStatus } from './PaymentStatus.style'
import { useAppDispatch } from '@/hooks'
import { cartClear, orderClear } from '@/store'
import { OrderStatus } from '@/types'
import logo from '@/assets/image/logo.png'

export function PaymentStatus() {
  const stripe = useStripe()
  const navigate = useNavigate()
  const [status, setStatus] = useState({
    intent: '',
    message: 'Retrieving payment status...',
  })
  const dispatch = useAppDispatch()

  useEffect(() => {
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret',
    )

    if (!stripe || !clientSecret) {
      return
    }

    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case 'succeeded': {
            setStatus({
              intent: paymentIntent.status,
              message: 'Success! Payment received.',
            })

            const fullName = paymentIntent.shipping?.name?.trim() ?? ''
            const [firstName, ...rest] = fullName.split(/\s+/)
            const lastName = rest.join(' ')

            void updateOrder({
              paymentId: paymentIntent.id,
              fields: {
                paymentIntentStatus: paymentIntent.status,
                orderStatus: OrderStatus.Paid,
                firstName,
                lastName,
                email: paymentIntent.receipt_email,
                phone: paymentIntent.shipping?.phone,
                address: paymentIntent.shipping?.address,
              },
            })

            dispatch(cartClear())
            dispatch(orderClear())
            break
          }

          case 'processing': {
            setStatus({
              intent: paymentIntent.status,
              message:
                "Payment processing. We'll update you when payment is received.",
            })
            break
          }

          case 'requires_payment_method': {
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment failed. Please try another payment method.',
            })
            break
          }

          default: {
            setStatus({
              intent: 'unknown_error',
              message: 'Something went wrong.',
            })
            break
          }
        }
      })
      .catch(() =>
        setStatus({
          intent: 'retrieve_error',
          message: 'Error retrieving payment status.',
        }),
      )
  }, [dispatch, stripe])

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      <Status>
        {status.intent === 'succeeded' && (
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        )}
      </Status>
      <p>{status.message}</p>
      <button onClick={() => void navigate('/')} type="button">
        Back to home
      </button>
    </StyledPaymentStatus>
  )
}
