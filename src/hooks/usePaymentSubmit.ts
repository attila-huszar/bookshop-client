import { SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes'
import { baseURL } from '@/constants'
import { handleError } from '@/errors/handleError'
import type { StripeErrorType } from '@/types/Stripe'
import { useMessages } from './useMessages'

type UsePaymentSubmitReturn = {
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  retryPayment: () => Promise<void>
  canRetry: boolean
  message: string | null
  setMessage: (message: string | null) => void
  isLoading: boolean
}

const retryableStripeErrorTypes: StripeErrorType[] = [
  'api_connection_error',
  'api_error',
  'rate_limit_error',
]

const isRetryableStripeError = (errorType: StripeErrorType): boolean =>
  retryableStripeErrorTypes.includes(errorType)

export function usePaymentSubmit(email: string): UsePaymentSubmitReturn {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { getCheckoutText, getPaymentErrorMessage } = useMessages()
  const [message, setMessage] = useState<string | null>(null)
  const [canRetry, setCanRetry] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { submit: submitText } = getCheckoutText()

  const submitPayment = async (): Promise<void> => {
    setMessage(null)
    setCanRetry(false)
    setIsLoading(true)

    if (!stripe || !elements) {
      setMessage(submitText.notReady)
      setIsLoading(false)
      return
    }

    if (!email) {
      setMessage(submitText.missingEmail)
      setIsLoading(false)
      return
    }

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: email,
          payment_method_data: {
            billing_details: { email },
          },
          return_url: `${baseURL}/${ROUTE.CHECKOUT}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(getPaymentErrorMessage(error))
        setCanRetry(isRetryableStripeError(error.type))
        return
      }

      if (paymentIntent) {
        const searchParams = new URLSearchParams()
        searchParams.set('redirect_status', paymentIntent.status)

        void navigate(`/${ROUTE.CHECKOUT}?${searchParams.toString()}`, {
          replace: true,
        })
      }
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: submitText.submitFailed,
      })
      setMessage(formattedError.message)
      setCanRetry(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    await submitPayment()
  }

  const retryPayment = async (): Promise<void> => {
    if (isLoading) return
    await submitPayment()
  }

  return {
    handleSubmit,
    retryPayment,
    canRetry,
    message,
    setMessage,
    isLoading,
  }
}
