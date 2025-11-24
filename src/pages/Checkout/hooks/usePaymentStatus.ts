import { useState, useEffect } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { useAppDispatch } from '@/hooks'
import { cartClear, orderClear } from '@/store'
import { updateOrderStatus } from '@/helpers'
import { handleError } from '@/errors'
import { OrderStatus } from '@/types'

const MAX_RETRIES = 3
const RETRY_DELAY = 2000

export function usePaymentStatus(clientSecret: string | null) {
  const stripe = useStripe()
  const dispatch = useAppDispatch()

  const [status, setStatus] = useState({
    intent: '',
    message: 'Retrieving payment status...',
  })

  useEffect(() => {
    if (!stripe) return

    if (!clientSecret) {
      setStatus({
        intent: 'missing_secret',
        message: 'Payment information is missing. Please contact support.',
      })
      return
    }

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
          case 'succeeded':
            setStatus({
              intent: paymentIntent.status,
              message:
                'Success! Your payment has been processed. A confirmation email will arrive shortly.',
            })

            await updateOrderStatus(paymentIntent, OrderStatus.Paid)
            dispatch(cartClear())
            dispatch(orderClear())
            break

          case 'processing':
            setStatus({
              intent: paymentIntent.status,
              message:
                "Payment processing. We'll update you when payment is received.",
            })

            if (attempt < MAX_RETRIES) {
              setTimeout(() => {
                void retrievePaymentStatus(attempt + 1)
              }, RETRY_DELAY * attempt)
            }
            break

          case 'requires_payment_method':
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment failed. Please try another payment method.',
            })
            break

          case 'requires_confirmation':
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment requires confirmation. Please try again.',
            })
            break

          case 'requires_action':
            setStatus({
              intent: paymentIntent.status,
              message:
                'Payment requires additional action. Please complete the verification.',
            })
            break

          case 'canceled':
            setStatus({
              intent: paymentIntent.status,
              message: 'Payment was canceled.',
            })
            break

          default:
            setStatus({
              intent: 'unknown_status',
              message: `Payment status: ${paymentIntent.status}. Please contact support if this persists.`,
            })
            break
        }
      } catch (error) {
        if (attempt < MAX_RETRIES) {
          setStatus({
            intent: 'retrying',
            message: `Error retrieving payment status. Retrying... (${attempt}/${MAX_RETRIES})`,
          })
          setTimeout(() => {
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
  }, [clientSecret, dispatch, stripe])

  return { status }
}
