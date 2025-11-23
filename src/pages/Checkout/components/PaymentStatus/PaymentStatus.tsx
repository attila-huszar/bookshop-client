import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useStripe } from '@stripe/react-stripe-js'
import { updateOrder } from '@/api'
import { Logo, Status, StyledPaymentStatus } from './PaymentStatus.style'
import { useAppDispatch } from '@/hooks'
import { cartClear, orderClear } from '@/store'
import { handleError } from '@/errors'
import { OrderStatus } from '@/types'
import logo from '@/assets/image/logo.png'
import { toast } from 'react-hot-toast'

const MAX_RETRIES = 3
const RETRY_DELAY = 2000

export function PaymentStatus() {
  const stripe = useStripe()
  const navigate = useNavigate()
  const [status, setStatus] = useState({
    intent: '',
    message: 'Retrieving payment status...',
  })
  const [retryCount, setRetryCount] = useState(0)
  const dispatch = useAppDispatch()
  const effectRan = useRef(false)

  useEffect(() => {
    if (effectRan.current) return

    if (!stripe) return

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret',
    )

    if (!clientSecret) {
      setStatus({
        intent: 'missing_secret',
        message: 'Payment information is missing. Please contact support.',
      })
      return
    }

    effectRan.current = true

    const retrievePaymentStatus = async (attempt = 1): Promise<void> => {
      try {
        const { paymentIntent, error: retrieveError } =
          await stripe.retrievePaymentIntent(clientSecret)

        if (retrieveError) {
          throw new Error(
            retrieveError.message ?? 'Failed to retrieve payment intent',
          )
        }

        if (!paymentIntent) {
          throw new Error('Payment intent not found')
        }

        switch (paymentIntent.status) {
          case 'succeeded': {
            setStatus({
              intent: paymentIntent.status,
              message: 'Success! Payment received.',
            })

            try {
              const {
                id: paymentId,
                status: paymentStatus,
                receipt_email,
                shipping,
              } = paymentIntent

              const fullName = shipping?.name?.trim() ?? ''
              const [firstName, ...rest] = fullName.split(/\s+/)
              const lastName = rest.join(' ')

              await updateOrder({
                paymentId,
                fields: {
                  paymentIntentStatus: paymentStatus,
                  orderStatus: OrderStatus.Paid,
                  firstName,
                  lastName,
                  email: receipt_email,
                  phone: shipping?.phone,
                  address: shipping?.address,
                },
              })

              dispatch(cartClear())
              dispatch(orderClear())
            } catch (updateError) {
              const formattedError = await handleError({
                error: updateError,
                message: 'Payment succeeded but order update failed',
              })
              toast.error(
                'Payment received, but there was an issue updating your order. Please contact support.',
                { id: 'order-update-error', duration: 10000 },
              )
              console.error('Order update failed:', formattedError)

              dispatch(cartClear())
              dispatch(orderClear())
            }
            break
          }

          case 'processing': {
            setStatus({
              intent: paymentIntent.status,
              message:
                "Payment processing. We'll update you when payment is received.",
            })

            if (attempt < MAX_RETRIES) {
              setTimeout(() => {
                setRetryCount(attempt)
                void retrievePaymentStatus(attempt + 1)
              }, RETRY_DELAY * attempt)
            }
            break
          }

          case 'requires_payment_method': {
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment failed. Please try another payment method.',
            })
            break
          }

          case 'requires_confirmation': {
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment requires confirmation. Please try again.',
            })
            break
          }

          case 'requires_action': {
            setStatus({
              intent: paymentIntent.status,
              message:
                'Payment requires additional action. Please complete the verification.',
            })
            break
          }

          case 'canceled': {
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment was canceled.',
            })
            break
          }

          default: {
            setStatus({
              intent: 'unknown_status',
              message: `Payment status: ${paymentIntent.status}. Please contact support if this persists.`,
            })
            break
          }
        }
      } catch (error) {
        if (attempt < MAX_RETRIES) {
          setStatus({
            intent: 'retrying',
            message: `Error retrieving payment status. Retrying... (${attempt}/${MAX_RETRIES})`,
          })
          setTimeout(() => {
            setRetryCount(attempt)
            void retrievePaymentStatus(attempt + 1)
          }, RETRY_DELAY * attempt)
        } else {
          const formattedError = await handleError({
            error,
            message: 'Error retrieving payment intent after multiple attempts.',
          })

          setStatus({
            intent: 'retrieve_error',
            message: formattedError.message,
          })
        }
      }
    }

    void retrievePaymentStatus()
  }, [dispatch, stripe, retryCount])

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
            <p>You will receive a confirmation email shortly.</p>
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
