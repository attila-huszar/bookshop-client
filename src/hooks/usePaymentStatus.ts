import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import type { PaymentIntentStatus } from '@/types/Stripe'
import { useMessages } from './useMessages'

export type PaymentStatusMessageOverride =
  | { type: 'retry'; attempt: number; maxRetries: number }
  | { type: 'failure'; details: string }
  | { type: 'timeout'; timeoutSeconds: number }

export type PaymentStatusState = {
  intent: PaymentIntentStatus
  messageOverride: PaymentStatusMessageOverride | null
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000
const ABSOLUTE_TIMEOUT = 30000

export function usePaymentStatus(session: string | null | undefined) {
  const stripe = useStripe()
  const { getUnknownErrorMessage } = useMessages()
  const [status, setStatus] = useState<PaymentStatusState>({
    intent: 'processing',
    messageOverride: null,
  })

  useEffect(() => {
    if (!stripe || !session) return

    const timeoutIds: ReturnType<typeof setTimeout>[] = []
    let absoluteTimeoutId: ReturnType<typeof setTimeout> | null = null
    let isSettled = false
    let hasTimedOut = false

    const markSettled = () => {
      isSettled = true
      if (absoluteTimeoutId) {
        clearTimeout(absoluteTimeoutId)
      }
    }

    const scheduleRetry = (attempt: number) => {
      const timeoutId = setTimeout(() => {
        void retrievePaymentStatus(attempt + 1)
      }, RETRY_DELAY * attempt)
      timeoutIds.push(timeoutId)
    }

    const retrievePaymentStatus = async (attempt = 1): Promise<void> => {
      if (hasTimedOut || isSettled) return

      try {
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(session)

        if (hasTimedOut || isSettled) return

        if (error) {
          throw new Error(error.message ?? 'Failed to retrieve payment intent')
        }

        setStatus({
          intent: paymentIntent.status,
          messageOverride: null,
        })

        if (paymentIntent.status !== 'processing') {
          markSettled()
          return
        }

        if (attempt < MAX_RETRIES) {
          scheduleRetry(attempt)
        }
      } catch (error) {
        if (hasTimedOut || isSettled) return

        if (attempt < MAX_RETRIES) {
          setStatus({
            intent: 'processing',
            messageOverride: {
              type: 'retry',
              attempt,
              maxRetries: MAX_RETRIES,
            },
          })
          scheduleRetry(attempt)
        } else {
          setStatus({
            intent: 'requires_payment_method',
            messageOverride: {
              type: 'failure',
              details: getUnknownErrorMessage(error),
            },
          })
          markSettled()
        }
      }
    }

    absoluteTimeoutId = setTimeout(() => {
      if (isSettled) return
      hasTimedOut = true
      setStatus({
        intent: 'requires_payment_method',
        messageOverride: {
          type: 'timeout',
          timeoutSeconds: ABSOLUTE_TIMEOUT / 1000,
        },
      })
      markSettled()
    }, ABSOLUTE_TIMEOUT)
    timeoutIds.push(absoluteTimeoutId)

    void retrievePaymentStatus()

    return () => {
      timeoutIds.forEach(clearTimeout)
    }
  }, [getUnknownErrorMessage, session, stripe])

  return { status }
}
