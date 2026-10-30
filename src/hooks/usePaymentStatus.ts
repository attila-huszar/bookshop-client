import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { getErrorMessage } from '@/helpers/errors'
import type { PaymentStatusState } from '@/types/Payment'

const MAX_ATTEMPTS = 3
const RETRY_DELAY = 5000
const ABSOLUTE_TIMEOUT = 30000
const INITIAL_STATUS: PaymentStatusState = { type: 'checking' }

export function usePaymentStatus(paymentToken: string | null | undefined) {
  const stripe = useStripe()
  const [retryCount, setRetryCount] = useState(0)
  const [status, setStatus] = useState<PaymentStatusState>(INITIAL_STATUS)
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

    const stopPolling = () => {
      active = false
      clearTimeout(retryTimeoutId)
      clearTimeout(absoluteTimeoutId)
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

        setStatus({ type: paymentIntent.status })

        if (paymentIntent.status !== 'processing') {
          stopPolling()

          return
        }
      } catch (error) {
        if (!active) {
          return
        }

        if (attempt >= MAX_ATTEMPTS) {
          setStatus({
            type: 'failure',
            details: getErrorMessage(error, ''),
          })
          stopPolling()

          return
        }

        setStatus({
          type: 'retry',
          attempt: attempt + 1,
          maxAttempts: MAX_ATTEMPTS,
        })
      }

      if (attempt < MAX_ATTEMPTS) {
        retryTimeoutId = setTimeout(
          () => {
            void retrievePaymentStatus(attempt + 1)
          },
          RETRY_DELAY * 2 ** (attempt - 1),
        )
      }
    }

    const absoluteTimeoutId = setTimeout(() => {
      if (!active) {
        return
      }

      setStatus({
        type: 'timeout',
        timeoutSeconds: ABSOLUTE_TIMEOUT / 1000,
      })
      stopPolling()
    }, ABSOLUTE_TIMEOUT)

    void retrievePaymentStatus()

    return stopPolling
  }, [retryCount, paymentToken, stripe])

  const retry = () => {
    setStatus(INITIAL_STATUS)
    setRetryCount((current) => current + 1)
  }

  return { status, retry }
}
