import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import { getErrorMessage } from '@/helpers/errors'
import { paymentStatusPolicy } from '@/constants/payment'
import { TimeMs } from '@/constants/time'
import type { PaymentStatusState } from '@/types/Payment'

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

        if (attempt >= paymentStatusPolicy.maxAttempts) {
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
          maxAttempts: paymentStatusPolicy.maxAttempts,
        })
      }

      if (attempt < paymentStatusPolicy.maxAttempts) {
        retryTimeoutId = setTimeout(
          () => {
            void retrievePaymentStatus(attempt + 1)
          },
          paymentStatusPolicy.retryDelayMs *
            paymentStatusPolicy.retryMultiplier ** (attempt - 1),
        )
      }
    }

    const absoluteTimeoutId = setTimeout(() => {
      if (!active) {
        return
      }

      setStatus({
        type: 'timeout',
        timeoutSeconds: paymentStatusPolicy.timeoutMs / TimeMs.OneSecond,
      })
      stopPolling()
    }, paymentStatusPolicy.timeoutMs)

    void retrievePaymentStatus()

    return stopPolling
  }, [retryCount, paymentToken, stripe])

  const retry = () => {
    setStatus(INITIAL_STATUS)
    setRetryCount((current) => current + 1)
  }

  return { status, retry }
}
