import { useState, useEffect } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntent } from '@stripe/stripe-js'
import { updateOrderStatus } from '@/helpers'
import { useMessages } from './useMessages'
import { handleError } from '@/errors'
import { OrderStatus } from '@/types'

type PaymentStatus = {
  intent: PaymentIntent.Status
  message: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

export function usePaymentStatus(clientSecret: string | null) {
  const stripe = useStripe()

  const { getMessage } = useMessages()

  const [status, setStatus] = useState<PaymentStatus>({
    intent: 'processing',
    message: 'Retrieving payment status...',
  })

  useEffect(() => {
    if (!stripe || !clientSecret) return

    const timeoutIds: NodeJS.Timeout[] = []

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
          case 'processing':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })

            if (attempt < MAX_RETRIES) {
              const timeoutId = setTimeout(() => {
                void retrievePaymentStatus(attempt + 1)
              }, RETRY_DELAY * attempt)
              timeoutIds.push(timeoutId)
            }
            break

          case 'succeeded':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })

            try {
              await updateOrderStatus(paymentIntent, OrderStatus.Paid)
            } catch (updateError) {
              void handleError({
                error: updateError,
                message: 'Payment succeeded but order update failed.',
              })
            }
            break

          case 'requires_capture':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })

            try {
              await updateOrderStatus(paymentIntent, OrderStatus.Captured)
            } catch (updateError) {
              void handleError({
                error: updateError,
                message: 'Payment captured but order update failed.',
              })
            }
            break

          case 'requires_payment_method':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break

          case 'requires_confirmation':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break

          case 'requires_action':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break

          case 'canceled':
            setStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })

            try {
              await updateOrderStatus(paymentIntent, OrderStatus.Canceled)
            } catch (updateError) {
              void handleError({
                error: updateError,
                message: 'Payment canceled but order update failed.',
              })
            }
            break
        }
      } catch (error) {
        if (attempt < MAX_RETRIES) {
          setStatus({
            intent: 'processing',
            message: `Error retrieving payment status. Retrying... (${attempt}/${MAX_RETRIES})`,
          })
          const timeoutId = setTimeout(() => {
            void retrievePaymentStatus(attempt + 1)
          }, RETRY_DELAY * attempt)
          timeoutIds.push(timeoutId)
        } else {
          const formattedError = await handleError({
            error,
            message: 'Error retrieving payment intent after multiple attempts.',
          })

          setStatus({
            intent: 'requires_payment_method',
            message: formattedError.message,
          })
        }
      }
    }

    void retrievePaymentStatus()

    return () => {
      timeoutIds.forEach(clearTimeout)
    }
  }, [clientSecret, stripe, getMessage])

  return { status }
}
