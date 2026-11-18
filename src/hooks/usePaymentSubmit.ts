import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import type { ParseKeys } from 'i18next'
import { ROUTE } from '@/routes/route'
import {
  useAcceptPaymentTermsMutation,
  useLazyPaymentQuery,
} from '@/store/api/paymentsApi'
import { checkoutSuperseded } from '@/store/slices/payment'
import { getCheckoutPaymentId } from '@/store/thunks/checkout'
import {
  checkoutQueryParams,
  getStripePaymentErrorMessage,
  isRetryableStripeError,
  isSuccessPaymentIntentStatus,
} from '@/helpers/checkout'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import { baseURL } from '@/constants/envConfig'
import type { ApiError, CheckoutTerms, ErrorCode, StripeError } from '@/types'
import { HttpErrorCode, TermsErrorCode } from '@/types/ApiError'
import { useAppDispatch } from './redux'
import { useLanguage } from './useLanguage'

const retryableApiCodes: readonly ErrorCode[] = [
  HttpErrorCode.Internal,
  HttpErrorCode.DatabaseBusy,
  HttpErrorCode.Timeout,
  HttpErrorCode.RateLimited,
  HttpErrorCode.UnknownResponse,
  TermsErrorCode.Unavailable,
]

type SubmissionError = {
  messageKey?: ParseKeys
  message?: string
  apiError?: ApiError
  stripeError?: Pick<StripeError, 'type' | 'message'>
  retryable?: boolean
}

type PaymentSubmitInput = {
  email: string
  paymentId: string
  terms: CheckoutTerms | null
  termsAccepted: boolean
}

export function usePaymentSubmit(input: PaymentSubmitInput) {
  const { t, language } = useLanguage()
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [submissionError, setSubmissionError] =
    useState<SubmissionError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const submitting = useRef(false)
  const lifecycleRef = useRef<{ active: boolean } | null>(null)
  const [acceptTerms] = useAcceptPaymentTermsMutation()
  const [retrievePayment] = useLazyPaymentQuery()
  const { email, paymentId, terms, termsAccepted } = input

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    return () => {
      lifecycle.active = false
    }
  }, [])

  const recoverPaymentStatus = async (error: StripeError) => {
    if (
      error.code !== 'payment_intent_unexpected_state' &&
      !isRetryableStripeError(error.type)
    ) {
      return
    }

    // Another tab may have confirmed, or our response may have been lost.
    // A failed lookup must preserve the original confirmation error.
    const current = await retrievePayment(paymentId, false)
      .unwrap()
      .catch(() => undefined)

    if (
      isSuccessPaymentIntentStatus(current?.status) ||
      current?.status === 'processing' ||
      current?.status === 'canceled'
    ) {
      return current?.status
    }
  }

  const submitPayment = async (): Promise<void> => {
    const lifecycle = lifecycleRef.current

    if (submitting.current || !lifecycle?.active) {
      return
    }

    setSubmissionError(null)

    if (!terms || !termsAccepted) {
      setSubmissionError({ messageKey: 'terms.required' })

      return
    }

    if (paymentId && getCheckoutPaymentId() !== paymentId) {
      dispatch(checkoutSuperseded())

      return
    }

    if (!stripe || !elements || !paymentId) {
      setSubmissionError({ messageKey: 'checkout.notReady' })

      return
    }

    if (!email) {
      setSubmissionError({ messageKey: 'checkout.missingEmail' })

      return
    }

    submitting.current = true
    setIsLoading(true)

    const canContinue = () => {
      if (!lifecycle.active) {
        return false
      }

      if (getCheckoutPaymentId() !== paymentId) {
        dispatch(checkoutSuperseded())

        return false
      }

      return true
    }

    try {
      // Persist acceptance before Stripe can confirm or redirect the payment.
      await acceptTerms({
        paymentId,
        version: terms.version,
        language,
        accepted: true,
      }).unwrap()

      if (!canContinue()) {
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

      if (!canContinue()) {
        return
      }

      let status = paymentIntent?.status

      if (error) {
        status = await recoverPaymentStatus(error)

        if (!canContinue()) {
          return
        }
      }

      if (!status) {
        setSubmissionError({
          stripeError: error
            ? { type: error.type, message: error.message }
            : undefined,
          retryable: error ? isRetryableStripeError(error.type) : false,
        })

        return
      }

      const searchParams = new URLSearchParams({
        [checkoutQueryParams.redirectStatus]: status,
      })

      void navigate(`/${ROUTE.CHECKOUT}?${searchParams.toString()}`, {
        replace: true,
      })
    } catch (error) {
      if (!canContinue()) {
        return
      }

      const apiError = getApiError(error)
      setSubmissionError({
        message: apiError ? undefined : getErrorMessage(error, '') || undefined,
        retryable: !apiError || retryableApiCodes.includes(apiError.code),
        apiError,
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

  let error: string | null = null

  if (submissionError) {
    const fallback = submissionError.stripeError
      ? getStripePaymentErrorMessage(submissionError.stripeError, t)
      : t(submissionError.messageKey ?? 'checkout.submitFailed')
    error = getErrorMessage(
      submissionError.apiError,
      submissionError.message ?? fallback,
    )
  }

  return {
    handleSubmit,
    canRetry: submissionError?.retryable ?? false,
    error,
    clearError: () => setSubmissionError(null),
    isLoading,
  }
}
