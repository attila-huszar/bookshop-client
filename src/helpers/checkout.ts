import { i18n } from '@/i18n'
import type { TFunction } from 'i18next'
import type {
  Cart,
  PaymentIntentStatus,
  PaymentStatusState,
  StripeError,
  StripeErrorType,
} from '@/types'

export const checkoutQueryParams = {
  paymentIntent: 'payment_intent',
  paymentToken: 'payment_intent_client_secret',
  redirectStatus: 'redirect_status',
} as const

export const paymentSessionUnavailableCode = 'session_unavailable'

const successStatuses = [
  'requires_capture',
  'succeeded',
] as const satisfies readonly PaymentIntentStatus[]

export const paymentStatusEmoji = {
  // PaymentIntent statuses returned by Stripe.
  requires_payment_method: '💳',
  requires_confirmation: '🧾',
  requires_action: '🔐',
  processing: '⏳',
  requires_capture: '🔒',
  succeeded: '✅',
  canceled: '❌',

  // Local polling states and the unknown-status display fallback.
  checking: '⏳',
  retry: '🔄',
  timeout: '⏱️',
  failure: '⚠️',
  unknown: '❓',
} as const satisfies Record<PaymentStatusState['type'] | 'unknown', string>

const retryableStripeErrorTypes: readonly StripeErrorType[] = [
  'api_connection_error',
  'api_error',
  'rate_limit_error',
]

export const calculateTotalAmount = (cartItems: Cart[]): number =>
  cartItems.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )

export const formatAmount = (
  amount: number,
  language = 'en',
  minimumFractionDigits = 2,
): string =>
  amount.toLocaleString(language, {
    minimumFractionDigits,
    maximumFractionDigits: 2,
    useGrouping: false,
  })

export const isSuccessPaymentIntentStatus = (
  status: unknown,
): status is (typeof successStatuses)[number] =>
  successStatuses.some((successStatus) => successStatus === status)

export const formatPaymentStatus = (
  status: PaymentIntentStatus | undefined,
): string => {
  const emoji = paymentStatusEmoji[status ?? 'unknown']
  const formattedStatus = status
    ? i18n.t(`payment.labels.${status}`)
    : i18n.t('common.unknown')

  return `${emoji} ${formattedStatus}`
}

/** Whether a Stripe service error permits another checkout confirmation attempt. */
export const isRetryableStripeError = (errorType: StripeErrorType): boolean =>
  retryableStripeErrorTypes.includes(errorType)

/**
 * Select Stripe SDK error text using the caller's translator.
 * Prefer Stripe messages for card/validation errors and unknown types;
 * known service/configuration errors use the shop's translated wording.
 */
export function getStripePaymentErrorMessage(
  error: StripeError,
  t: TFunction,
): string {
  switch (error.type) {
    case 'card_error':
      return error.message ?? t('payment.errors.card_error')

    case 'validation_error':
      return error.message ?? t('payment.errors.validation_error')

    case 'rate_limit_error':
      return t('payment.errors.rate_limit_error')

    case 'api_connection_error':
      return t('payment.errors.api_connection_error')

    case 'api_error':
      return t('payment.errors.api_error')

    case 'authentication_error':
      return t('payment.errors.authentication_error')

    case 'invalid_request_error':
      return t('payment.errors.invalid_request_error')

    case 'idempotency_error':
      return t('payment.errors.idempotency_error')

    default:
      return error.message ?? t('common.unexpectedError')
  }
}
