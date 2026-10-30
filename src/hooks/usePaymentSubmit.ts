import { type SubmitEvent, useEffect, useRef, useState } from 'react'
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
import type { ApiError, CheckoutTerms, ErrorCode } from '@/types'
import { HttpErrorCode, TermsErrorCode } from '@/types/ApiError'

const retryableApiCodes: readonly ErrorCode[] = [
  HttpErrorCode.Internal,
  HttpErrorCode.Timeout,
  HttpErrorCode.RateLimited,
  HttpErrorCode.UnknownResponse,
  TermsErrorCode.Unavailable,
]

type SubmitMessage = {
  text: string | null
  type: 'neutral' | 'error'
  error?: ApiError
  retryable?: boolean
}

type PaymentSubmitInput = {
  email: string
  paymentId: string
  terms: CheckoutTerms | null
  termsAccepted: boolean
}

export function usePaymentSubmit(input: PaymentSubmitInput) {
  const { t, i18n } = useTranslation()
  const language = shopLanguage(i18n.resolvedLanguage)
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [message, setMessage] = useState<SubmitMessage>({
    text: null,
    type: 'neutral',
  })
  const [isLoading, setIsLoading] = useState(false)
  const submitting = useRef(false)
  const lifecycleRef = useRef<{ active: boolean } | null>(null)
  const [acceptTerms] = useAcceptPaymentTermsMutation()
  const { email, paymentId, terms, termsAccepted } = input

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    return () => {
      lifecycle.active = false
    }
  }, [])

  const submitPayment = async (): Promise<void> => {
    const lifecycle = lifecycleRef.current

    if (submitting.current || !lifecycle?.active) {
      return
    }

    setMessage({ text: null, type: 'neutral' })

    if (!terms || !termsAccepted) {
      setMessage({ text: t('terms.required'), type: 'error' })

      return
    }

    if (!stripe || !elements || !paymentId) {
      setMessage({ text: t('checkout.notReady'), type: 'error' })

      return
    }

    if (!email) {
      setMessage({ text: t('checkout.missingEmail'), type: 'error' })

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

      if (!lifecycle.active) {
        return
      }

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

      if (!lifecycle.active) {
        return
      }

      if (error) {
        setMessage({
          text: getStripePaymentErrorMessage(error, t),
          type: 'error',
          retryable: isRetryableStripeError(error.type),
        })

        return
      }

      const searchParams = new URLSearchParams({
        [checkoutQueryParams.redirectStatus]: paymentIntent.status,
      })

      void navigate(`/${ROUTE.CHECKOUT}?${searchParams.toString()}`, {
        replace: true,
      })
    } catch (error) {
      if (!lifecycle.active) {
        return
      }

      const apiError = getApiError(error)
      setMessage({
        text: getErrorMessage(error, t('checkout.submitFailed')),
        type: 'error',
        retryable: !apiError || retryableApiCodes.includes(apiError.code),
        ...(apiError ? { error: apiError } : {}),
      })
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    return submitPayment()
  }

  return {
    handleSubmit,
    canRetry: message.retryable ?? false,
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
