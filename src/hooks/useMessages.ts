import { PaymentIntentStatus, StripeError } from '@/types'

type UseMessagesReturn = {
  getMessage: (status: PaymentIntentStatus) => string
  getErrorMessage: (error: StripeError) => string
}

export function useMessages(): UseMessagesReturn {
  // TODO: Add i18n

  const getErrorMessage = (error: StripeError): string => {
    switch (error.type) {
      case 'card_error':
        return (
          error.message ??
          'Your card was declined. Please check your card details or try a different payment method.'
        )

      case 'validation_error':
        return (
          error.message ??
          'Please check your payment information and try again.'
        )

      case 'rate_limit_error':
        return 'Too many requests. Please wait a moment and try again.'

      case 'api_connection_error':
        return 'Unable to connect to payment services. Please check your internet connection.'

      case 'api_error':
        return 'Payment system is temporarily unavailable. Please try again in a few moments.'

      case 'authentication_error':
        return 'Payment authentication failed. This issue has been logged. Please contact support.'

      case 'invalid_request_error':
        return 'Invalid payment request. Please refresh the page or contact support if the issue persists.'

      case 'idempotency_error':
        return 'This payment may have already been processed. Please refresh and verify your order.'

      default:
        return (
          error.message ?? 'An unexpected error occurred. Please try again.'
        )
    }
  }

  const getMessage = (status: PaymentIntentStatus): string => {
    switch (status) {
      case 'succeeded':
        return 'Success! Your payment has been processed. A confirmation email will arrive shortly.'

      case 'processing':
        return "Your payment is currently processing. We'll update you as soon as it goes through."

      case 'requires_payment_method':
        return "Your payment didn't go through. Please verify your payment details or try a different method."

      case 'requires_confirmation':
        return 'We just need you to confirm the payment to finalize your order.'

      case 'requires_action':
        return 'Additional verification is needed. Please follow the prompts to authenticate your payment.'

      case 'requires_capture':
        return 'Payment approved! Your funds are reserved and will be charged once your order is ready to ship.'

      case 'canceled':
        return 'This payment was canceled. No charges were applied.'
    }
  }

  return { getErrorMessage, getMessage }
}
