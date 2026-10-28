import { SubmitEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { shopLanguage } from '@/i18n'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes/route'
import { useAcceptPaymentTermsMutation } from '@/store/api/termsApi'
import {
  checkoutQueryParams,
  getStripePaymentErrorMessage,
  isRetryableStripeError,
} from '@/helpers/checkout'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import { baseURL } from '@/constants/envConfig'
import type { ApiError, CheckoutTerms } from '@/types'

type SubmitMessage = {
  text: string | null
  type: 'neutral' | 'error'
  error?: ApiError
}

type UsePaymentSubmitReturn = {
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  retryPayment: () => Promise<void>
  canRetry: boolean
  message: SubmitMessage
  setMessage: (message: SubmitMessage) => void
  isLoading: boolean
}

type PaymentSubmitInput = {
  email: string
  paymentId: string
  terms: CheckoutTerms | null
  termsAccepted: boolean
}

export function usePaymentSubmit(
  input: PaymentSubmitInput,
): UsePaymentSubmitReturn {
  const { t, i18n } = useTranslation()
  const language = shopLanguage(i18n.resolvedLanguage)
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [message, setMessage] = useState<SubmitMessage>({
    text: null,
    type: 'neutral',
  })
  const [canRetry, setCanRetry] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const submitting = useRef(false)
  const [acceptTerms] = useAcceptPaymentTermsMutation()
  const { email, paymentId, terms, termsAccepted } = input

  const stopSubmitWithMessage = (text: string): void => {
    setMessage({ text, type: 'error' })
  }

  const submitPayment = async (): Promise<void> => {
    if (submitting.current) {
      return
    }

    setMessage({ text: null, type: 'neutral' })
    setCanRetry(false)

    if (!terms || !termsAccepted) {
      stopSubmitWithMessage(t('terms.required'))

      return
    }

    if (!stripe || !elements) {
      stopSubmitWithMessage(t('checkout.notReady'))

      return
    }

    if (!email) {
      stopSubmitWithMessage(t('checkout.missingEmail'))

      return
    }

    submitting.current = true
    setIsLoading(true)

    try {
      // Persist acceptance before Stripe can confirm or redirect the payment.
      await acceptTerms({
        paymentId,
        version: terms.version,
        language,
        accepted: true,
      }).unwrap()

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
        setMessage({
          text: getStripePaymentErrorMessage(error, t),
          type: 'error',
        })
        setCanRetry(isRetryableStripeError(error.type))

        return
      }

      if (paymentIntent) {
        const searchParams = new URLSearchParams()
        searchParams.set(
          checkoutQueryParams.redirectStatus,
          paymentIntent.status,
        )

        void navigate(`/${ROUTE.CHECKOUT}?${searchParams.toString()}`, {
          replace: true,
        })
      }
    } catch (error) {
      const apiError = getApiError(error)
      setMessage({
        text: getErrorMessage(error, t('checkout.submitFailed')),
        type: 'error',
        ...(apiError ? { error: apiError } : {}),
      })
      setCanRetry(true)
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    await submitPayment()
  }

  return {
    handleSubmit,
    retryPayment: submitPayment,
    canRetry,
    message: message.error
      ? {
          ...message,
          text: getErrorMessage(message.error, t('checkout.submitFailed')),
        }
      : message,
    setMessage,
    isLoading,
  }
}
