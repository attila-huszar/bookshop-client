import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { getErrorMessage } from '@/helpers/errors'
import type { PaymentIntentStatus } from '@/types/Stripe'

export type PaymentStatusMessageOverride =
  | { type: 'retry'; attempt: number; maxRetries: number }
  | { type: 'failure'; details: string }
  | { type: 'timeout'; timeoutSeconds: number }

export type PaymentStatusState = {
  intent: PaymentIntentStatus | null
  messageOverride: PaymentStatusMessageOverride | null
}

const MAX_ATTEMPTS = 3
const RETRY_DELAY = 5000
const ABSOLUTE_TIMEOUT = 30000
const INITIAL_STATUS: PaymentStatusState = {
  intent: null,
  messageOverride: null,
}

export function usePaymentStatus(paymentToken: string | null | undefined) {
  const stripe = useStripe()
  const [retryCount, setRetryCount] = useState(0)
  const [status, setStatus] = useState(INITIAL_STATUS)
  const [activePaymentToken, setActivePaymentToken] = useState(paymentToken)

  // Keep the final result when checkout clears its session after success.
  if (paymentToken && paymentToken !== activePaymentToken) {
    setActivePaymentToken(paymentToken)
    setStatus(INITIAL_STATUS)
  }

  useEffect(() => {
    if (!stripe || !paymentToken) {
      return
    }

    let retryTimeoutId: ReturnType<typeof setTimeout> | undefined
    let active = true

    const markSettled = () => {
      active = false
      clearTimeout(retryTimeoutId)
      clearTimeout(absoluteTimeoutId)
    }

    const scheduleRetry = (attempt: number) => {
      retryTimeoutId = setTimeout(
        () => {
          void retrievePaymentStatus(attempt + 1)
        },
        RETRY_DELAY * 2 ** (attempt - 1),
      )
    }

    const retrievePaymentStatus = async (attempt = 1): Promise<void> => {
      if (!active) {
        return
      }

      try {
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(paymentToken)

        if (!active) {
          return
        }

        if (error) {
          throw new Error(error.message)
        }

        setStatus({
          intent: paymentIntent.status,
          messageOverride: null,
        })

        if (paymentIntent.status !== 'processing') {
          markSettled()

          return
        }

        if (attempt < MAX_ATTEMPTS) {
          scheduleRetry(attempt)
        }
      } catch (error) {
        if (!active) {
          return
        }

        if (attempt < MAX_ATTEMPTS) {
          setStatus({
            intent: null,
            messageOverride: {
              type: 'retry',
              attempt,
              maxRetries: MAX_ATTEMPTS,
            },
          })
          scheduleRetry(attempt)
        } else {
          setStatus({
            intent: null,
            messageOverride: {
              type: 'failure',
              details: getErrorMessage(error, ''),
            },
          })
          markSettled()
        }
      }
    }

    const absoluteTimeoutId = setTimeout(() => {
      if (!active) {
        return
      }
      setStatus({
        intent: null,
        messageOverride: {
          type: 'timeout',
          timeoutSeconds: ABSOLUTE_TIMEOUT / 1000,
        },
      })
      markSettled()
    }, ABSOLUTE_TIMEOUT)

    void retrievePaymentStatus()

    return markSettled
  }, [retryCount, paymentToken, stripe])

  const retry = () => {
    setStatus(INITIAL_STATUS)
    setRetryCount((current) => current + 1)
  }

  return { status, retry }
}
