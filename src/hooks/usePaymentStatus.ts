import { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import type { PaymentIntentStatus } from '@/types/Stripe'
import { useMessages } from './useMessages'

type PaymentStatus = {
  intent: PaymentIntentStatus
  message: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000
const ABSOLUTE_TIMEOUT = 30000

export function usePaymentStatus(session: string | null | undefined) {
  const stripe = useStripe()
  const {
    getPaymentIntentStatusMessage,
    getCheckoutStatusMessage,
    getUnknownErrorMessage,
  } = useMessages()
  const [status, setStatus] = useState<PaymentStatus>({
    intent: 'processing',
    message: getPaymentIntentStatusMessage('processing'),
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

    const checkoutStripeStatusMessages = getCheckoutStatusMessage()

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
          message: getPaymentIntentStatusMessage(paymentIntent.status),
        })

        if (paymentIntent.status !== 'processing') {
          markSettled()
          return
        }

        if (attempt < MAX_RETRIES) {
          const timeoutId = setTimeout(() => {
            void retrievePaymentStatus(attempt + 1)
          }, RETRY_DELAY * attempt)
          timeoutIds.push(timeoutId)
        }
      } catch (error) {
        if (hasTimedOut || isSettled) return

        if (attempt < MAX_RETRIES) {
          setStatus({
            intent: 'processing',
            message: checkoutStripeStatusMessages.retry(attempt, MAX_RETRIES),
          })
          const timeoutId = setTimeout(() => {
            void retrievePaymentStatus(attempt + 1)
          }, RETRY_DELAY * attempt)
          timeoutIds.push(timeoutId)
        } else {
          setStatus({
            intent: 'requires_payment_method',
            message: checkoutStripeStatusMessages.failure(
              getUnknownErrorMessage(error),
            ),
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
        message: checkoutStripeStatusMessages.absoluteTimeout(
          ABSOLUTE_TIMEOUT / 1000,
        ),
      })
      markSettled()
    }, ABSOLUTE_TIMEOUT)
    timeoutIds.push(absoluteTimeoutId)

    void retrievePaymentStatus()

    return () => {
      timeoutIds.forEach(clearTimeout)
    }
  }, [
    getCheckoutStatusMessage,
    getPaymentIntentStatusMessage,
    getUnknownErrorMessage,
    session,
    stripe,
  ])

  return { status }
}
