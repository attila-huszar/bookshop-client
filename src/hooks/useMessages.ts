import type { OrderSyncIssueCode } from '@/types/Order'
import type { PaymentIntentStatus, StripeError } from '@/types/Stripe'

const getPaymentErrorMessage = (error: StripeError): string => {
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
      return error.message ?? 'An unexpected error occurred. Please try again.'
  }
}

const getPaymentIntentStatusMessage = (status: PaymentIntentStatus): string => {
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

const getCheckoutStatusMessage = () => ({
  systemNotReady:
    'Payment system is not ready. Please wait a moment and try again.',
  missingEmail: 'Please provide your email to continue with checkout.',
  failed: 'Failed to process payment. Please try again.',
  retry: (attempt: number, maxRetries: number): string =>
    `Error retrieving payment status. Retrying... (${attempt}/${maxRetries})`,
  failure: (details: string): string =>
    `Error retrieving payment intent after multiple attempts: ${details}`,
  absoluteTimeout: (timeoutSeconds: number): string =>
    `Payment confirmation is taking longer than expected (${timeoutSeconds}s). Please refresh this page or check back in a moment.`,
})

const getCheckoutPrimaryMessage = () => ({
  syncInProgress: '🧾 Finalizing your order details...',
  paymentReceived: '✅ Payment received. Thank you for your purchase!',
  paymentCanceled: '❌ Payment canceled. Your order was not finalized.',
  paymentVerificationIssue:
    '🔒 We could not verify your order status for this session.',
  orderConfirmed: '✅ Order confirmed. A confirmation email is on the way.',
})

const getCheckoutSecondaryMessage = (
  orderSyncIssueCode: OrderSyncIssueCode | null,
  syncedPaymentStatus: PaymentIntentStatus | null = null,
): string => {
  if (syncedPaymentStatus === 'canceled') {
    return '❌ This payment was canceled before capture. You should not be charged. If you see a temporary hold, it should clear automatically.'
  }

  switch (orderSyncIssueCode) {
    case null:
      return "🧾 We're finalizing your order now. This usually takes only a few seconds, and you can safely leave this page."

    case 'timeout':
      return '⏳ Finalizing is taking longer than usual, but your payment is received. We are still processing in the background.'

    case 'retryable':
      return '🔄 We hit a temporary confirmation issue. We are retrying in the background.'

    case 'unauthorized':
      return '🔒 We could not verify your checkout session for this order. Please refresh and try again.'

    case 'unknown':
      return '⚠️ We could not confirm your final order state yet. Please refresh this page in a moment.'
  }
}

const getUnknownErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  return 'Unknown error'
}

export function useMessages() {
  // TODO: Add i18n
  return {
    getPaymentIntentStatusMessage,
    getPaymentErrorMessage,
    getCheckoutStatusMessage,
    getCheckoutPrimaryMessage,
    getCheckoutSecondaryMessage,
    getUnknownErrorMessage,
  }
}
