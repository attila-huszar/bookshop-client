import { useState, useEffect, useRef } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntent } from '@stripe/stripe-js'
import { useMessages } from './useMessages'
import { updateOrder } from '@/api'
import { OrderStatus } from '@/types'
import { splitFullName } from '@/helpers'
import { log } from '@/libs'

type PaymentStatus = {
  intent: PaymentIntent.Status
  message: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

const getUnknownErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  return 'Unknown error'
}

export function usePaymentStatus(clientSecret: string | null) {
  const stripe = useStripe()
  const isMountedRef = useRef(true)
  const orderUpdatedRef = useRef(false)

  const { getMessage } = useMessages()

  const [status, setStatus] = useState<PaymentStatus>({
    intent: 'processing',
    message: 'Retrieving payment status...',
  })

  useEffect(() => {
    isMountedRef.current = true
    orderUpdatedRef.current = false

    if (!stripe || !clientSecret) return

    const timeoutIds: NodeJS.Timeout[] = []

    const safeSetStatus = (newStatus: PaymentStatus) => {
      if (isMountedRef.current) {
        setStatus(newStatus)
      }
    }

    const updateOrderInDB = async (paymentIntent: PaymentIntent) => {
      if (orderUpdatedRef.current) return
      orderUpdatedRef.current = true

      try {
        const { firstName, lastName } = splitFullName(
          paymentIntent.shipping?.name ?? '',
        )

        await updateOrder({
          paymentId: paymentIntent.id,
          fields: {
            paymentIntentStatus: paymentIntent.status,
            orderStatus: OrderStatus.Paid,
            firstName,
            lastName,
            email: paymentIntent.receipt_email,
            shipping: paymentIntent.shipping,
          },
        })
      } catch (error) {
        void log.error('Failed to update order after payment success', {
          error,
          paymentId: paymentIntent.id,
        })
      }
    }

    const retrievePaymentStatus = async (attempt = 1): Promise<void> => {
      try {
        const { paymentIntent, error: retrieveError } =
          await stripe.retrievePaymentIntent(clientSecret)

        if (!isMountedRef.current) return

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
            safeSetStatus({
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
            safeSetStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            await updateOrderInDB(paymentIntent)
            break

          case 'requires_capture':
            safeSetStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            await updateOrderInDB(paymentIntent)
            break

          case 'requires_payment_method':
            safeSetStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break

          case 'requires_confirmation':
            safeSetStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break

          case 'requires_action':
            safeSetStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break

          case 'canceled':
            safeSetStatus({
              intent: paymentIntent.status,
              message: getMessage(paymentIntent.status),
            })
            break
        }
      } catch (error) {
        if (!isMountedRef.current) return

        if (attempt < MAX_RETRIES) {
          safeSetStatus({
            intent: 'processing',
            message: `Error retrieving payment status. Retrying... (${attempt}/${MAX_RETRIES})`,
          })
          const timeoutId = setTimeout(() => {
            void retrievePaymentStatus(attempt + 1)
          }, RETRY_DELAY * attempt)
          timeoutIds.push(timeoutId)
        } else {
          safeSetStatus({
            intent: 'requires_payment_method',
            message: `Error retrieving payment intent after multiple attempts: ${getUnknownErrorMessage(error)}`,
          })
        }
      }
    }

    void retrievePaymentStatus()

    return () => {
      isMountedRef.current = false
      timeoutIds.forEach(clearTimeout)
    }
  }, [clientSecret, stripe, getMessage])

  return { status }
}
