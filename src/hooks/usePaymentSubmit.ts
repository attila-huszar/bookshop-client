import { SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { AddressElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes'
import { baseURL } from '@/constants'
import { handleError } from '@/errors/handleError'
import { ConfirmPaymentShipping, StripeErrorType } from '@/types'
import { useMessages } from './useMessages'

type UsePaymentSubmitReturn = {
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  retryPayment: () => Promise<void>
  canRetry: boolean
  message: string | null
  setMessage: (message: string | null) => void
  isLoading: boolean
}

const retryableStripeErrorTypes = [
  'api_connection_error',
  'api_error',
  'rate_limit_error',
] satisfies StripeErrorType[]

type RetryableStripeErrorType = (typeof retryableStripeErrorTypes)[number]

const retryableStripeErrorTypeSet: Set<StripeErrorType> = new Set(
  retryableStripeErrorTypes,
)

const isRetryableStripeErrorType = (
  errorType: StripeErrorType,
): errorType is RetryableStripeErrorType =>
  retryableStripeErrorTypeSet.has(errorType)

export function usePaymentSubmit(receiptEmail: string): UsePaymentSubmitReturn {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { getErrorMessage } = useMessages()
  const [message, setMessage] = useState<string | null>(null)
  const [canRetry, setCanRetry] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getShippingFromAddressElement = async () => {
    if (!elements) return undefined

    const addressElement = elements.getElement(AddressElement)
    if (!addressElement) return undefined

    const { complete, value } = await addressElement.getValue()
    if (!complete || !value?.name) return undefined

    const shipping: ConfirmPaymentShipping = {
      name: value.name,
      phone: value.phone,
      address: {
        line1: value.address.line1,
        line2: value.address.line2 ?? undefined,
        city: value.address.city,
        state: value.address.state,
        postal_code: value.address.postal_code,
        country: value.address.country,
      },
    }

    return shipping
  }

  const submitPayment = async (): Promise<void> => {
    setMessage(null)
    setCanRetry(false)
    setIsLoading(true)
    const normalizedReceiptEmail = receiptEmail.trim()

    if (!stripe || !elements) {
      setMessage(
        'Payment system is not ready. Please wait a moment and try again.',
      )
      setIsLoading(false)
      return
    }

    if (!normalizedReceiptEmail) {
      setMessage('Please provide your email to continue with checkout.')
      setIsLoading(false)
      return
    }

    try {
      const shipping = await getShippingFromAddressElement()

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: normalizedReceiptEmail,
          payment_method_data: {
            billing_details: {
              email: normalizedReceiptEmail,
            },
          },
          return_url: `${baseURL}/${ROUTE.CHECKOUT}`,
          ...(shipping && { shipping }),
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(getErrorMessage(error))
        setCanRetry(isRetryableStripeErrorType(error.type))
        return
      }

      if (paymentIntent) {
        const searchParams = new URLSearchParams()
        if (paymentIntent.client_secret) {
          searchParams.set(
            'payment_intent_client_secret',
            paymentIntent.client_secret,
          )
        }
        searchParams.set('redirect_status', paymentIntent.status)

        void navigate(`/${ROUTE.CHECKOUT}?${searchParams.toString()}`, {
          replace: true,
        })
      }
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: 'Failed to process payment. Please try again.',
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
