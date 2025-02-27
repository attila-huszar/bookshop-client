import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStripe } from '@stripe/react-stripe-js'
import { Logo, Status, StyledPaymentStatus } from './PaymentStatus.style'
import { apiHandler } from '@/api/apiHandler'
import { useAppDispatch } from '@/hooks'
import { cartClear, orderClear } from '@/store'
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

            void apiHandler.updateOrder({
              paymentId: paymentIntent.id,
              fields: {
                orderStatus: 'paid',
                userName: paymentIntent.shipping?.name,
                userEmail: paymentIntent.receipt_email,
                userPhone: paymentIntent.shipping?.phone,
                userAddress: paymentIntent.shipping?.address,
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
  }, [stripe])

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
      <button onClick={() => navigate('/')} type="button">
        Back to home
      </button>
    </StyledPaymentStatus>
  )
}
