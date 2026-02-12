import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntentStatus } from '@/types'
import { useMessages } from './useMessages'

type PaymentStatus = {
  intent: PaymentIntentStatus
  message: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

const getUnknownErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  return 'Unknown error'
}

export function usePaymentStatus(session: string | null | undefined) {
  const stripe = useStripe()
  const { getMessage } = useMessages()

  const [status, setStatus] = useState<PaymentStatus>({
    intent: 'processing',
    message: getMessage('processing'),
  })

  useEffect(() => {
    if (!stripe || !session) return

    const timeoutIds: ReturnType<typeof setTimeout>[] = []

    const retrievePaymentStatus = async (attempt = 1): Promise<void> => {
      try {
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(session)

        if (error) {
          throw new Error(error.message ?? 'Failed to retrieve payment intent')
        }

        setStatus({
          intent: paymentIntent.status,
          message: getMessage(paymentIntent.status),
        })

        if (paymentIntent.status === 'processing' && attempt < MAX_RETRIES) {
          const timeoutId = setTimeout(() => {
            void retrievePaymentStatus(attempt + 1)
          }, RETRY_DELAY * attempt)
          timeoutIds.push(timeoutId)
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
          setStatus({
            intent: 'requires_payment_method',
            message: `Error retrieving payment intent after multiple attempts: ${getUnknownErrorMessage(error)}`,
          })
        }
      }
    }

    void retrievePaymentStatus()

    return () => {
      timeoutIds.forEach(clearTimeout)
    }
  }, [session, stripe, getMessage])

  return { status }
}
