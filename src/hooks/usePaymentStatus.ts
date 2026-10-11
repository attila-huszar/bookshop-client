import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import type { PaymentIntentStatus } from '@/types/Stripe'
import { useMessages } from './useMessages'

export type PaymentStatusMessageOverride =
  | { type: 'retry'; attempt: number; maxRetries: number }
  | { type: 'failure'; details: string }
  | { type: 'timeout'; timeoutSeconds: number }

export type PaymentStatusState = {
  intent: PaymentIntentStatus | null
  messageOverride: PaymentStatusMessageOverride | null
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000
const ABSOLUTE_TIMEOUT = 30000

export function usePaymentStatus(paymentToken: string | null | undefined) {
  const stripe = useStripe()
  const { getUnknownErrorDetails } = useMessages()
  const [retryCount, setRetryCount] = useState(0)
  const [status, setStatus] = useState<PaymentStatusState>({
    intent: null,
    messageOverride: null,
  })

  useEffect(() => {
    if (!stripe || !paymentToken) return

    const timeoutIds: ReturnType<typeof setTimeout>[] = []
    let absoluteTimeoutId: ReturnType<typeof setTimeout> | null = null
    let isSettled = false
    let hasTimedOut = false

    const isInactive = () => hasTimedOut || isSettled

    const markSettled = () => {
      isSettled = true
      if (absoluteTimeoutId) {
        clearTimeout(absoluteTimeoutId)
      }
    }

    const scheduleRetry = (attempt: number) => {
      const timeoutId = setTimeout(
        () => {
          void retrievePaymentStatus(attempt + 1)
        },
        RETRY_DELAY * 2 ** (attempt - 1),
      )
      timeoutIds.push(timeoutId)
    }

    const retrievePaymentStatus = async (attempt = 1): Promise<void> => {
      if (isInactive()) return

      try {
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(paymentToken)

        if (isInactive()) return

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
        if (isInactive()) return

        if (attempt < MAX_RETRIES) {
          setStatus({
            intent: null,
            messageOverride: {
              type: 'retry',
              attempt,
              maxRetries: MAX_RETRIES,
            },
          })
          scheduleRetry(attempt)
        } else {
          setStatus({
            intent: null,
            messageOverride: {
              type: 'failure',
              details: getUnknownErrorDetails(error),
            },
          })
          markSettled()
        }
      }
    }

    absoluteTimeoutId = setTimeout(() => {
      if (isInactive()) return
      hasTimedOut = true
      setStatus({
        intent: null,
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
      isSettled = true
      timeoutIds.forEach(clearTimeout)
    }
  }, [getUnknownErrorDetails, retryCount, paymentToken, stripe])

  const retry = () => {
    setStatus({ intent: null, messageOverride: null })
    setRetryCount((current) => current + 1)
  }

  return { status, retry }
}
