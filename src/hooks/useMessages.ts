import type { PaymentIntentStatus, StripeError } from '@/types/Stripe'

const getPaymentIntentStatusLabel = (status: PaymentIntentStatus): string => {
  switch (status) {
    case 'succeeded':
      return '✅ Your payment was successful.'

    case 'processing':
      return '⏳ Your payment is processing.'

    case 'requires_payment_method':
      return '❌ We could not complete your payment. Please try another method.'

    case 'requires_confirmation':
      return '🧾 Please confirm your payment to continue.'

    case 'requires_action':
      return '🔐 Please complete the required verification.'

    case 'requires_capture':
      return '✅ Payment approved and awaiting capture.'

    case 'canceled':
      return '❌ Payment canceled.'
  }
}

const getCheckoutSubmitMessages = () => ({
  notReady:
    'Payment form is still loading. Please wait a moment and try again.',
  missingEmail:
    'Email is required to continue checkout. Please enter your email and try again.',
  submitFailed: 'We could not process your payment. Please try again.',
})

const getCheckoutStatusMessages = () => ({
  retry: (attempt: number, maxRetries: number): string =>
    `🔄 We are retrying payment status (${attempt}/${maxRetries})...`,
  fetchFailed: (details: string): string =>
    `⚠️ We could not retrieve payment status: ${details}. Please refresh this page. If the issue continues, contact support and include your payment ID.`,
  timeout: (timeoutSeconds: number): string =>
    `⏳ Payment confirmation is taking longer than expected (${timeoutSeconds}s). Please refresh shortly.`,
  paymentReceived: '✅ Payment received. Thank you.',
  intent: getPaymentIntentStatusLabel,
})

export type CheckoutSubmitText = ReturnType<typeof getCheckoutSubmitMessages>
export type CheckoutStatusText = ReturnType<typeof getCheckoutStatusMessages>

const getStripePaymentErrorMessage = (error: StripeError): string => {
  switch (error.type) {
    case 'card_error':
      return (
        error.message ??
        'Your card was declined. Please check your card details or try a different payment method.'
      )

    case 'validation_error':
      return (
        error.message ?? 'Please check your payment information and try again.'
      )

    case 'rate_limit_error':
      return 'Too many requests right now. Please wait a moment and try again.'

    case 'api_connection_error':
      return 'Unable to connect to payment services. Please check your internet connection.'

    case 'api_error':
      return 'Payment service is temporarily unavailable. Please try again in a moment.'

    case 'authentication_error':
      return 'Payment authentication failed. Please contact support if the issue continues.'

    case 'invalid_request_error':
      return 'Invalid payment request. Please refresh the page or contact support if the issue persists.'

    case 'idempotency_error':
      return 'This payment may already be processed. Please refresh and verify your order.'

    default:
      return error.message ?? 'An unexpected error occurred. Please try again.'
  }
}

const getUnknownErrorDetails = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  return 'Unknown error'
}

export function useMessages() {
  // TODO: Add i18n
  return {
    getCheckoutSubmitMessages,
    getCheckoutStatusMessages,
    getStripePaymentErrorMessage,
    getUnknownErrorDetails,
  }
}
