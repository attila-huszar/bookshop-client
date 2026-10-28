import { i18n } from '@/i18n'
import type { TFunction } from 'i18next'
import { storedCartSchema } from '@/validation/orderSchemas'
import { cartKey, paymentIdempotencyKey } from '@/constants/keys'
import type {
  Cart,
  CartItem,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentStatusState,
  StripeError,
  StripeErrorType,
} from '@/types'
import { localStorageAdapter, sessionStorageAdapter } from './browserStorage'

type StoredPaymentIdempotency = {
  fingerprint: string
  clientIdempotencyKey: string
}

export const checkoutQueryParams = {
  paymentIntent: 'payment_intent',
  paymentToken: 'payment_intent_client_secret',
  redirectStatus: 'redirect_status',
} as const

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

/** Restore the saved basket, or start empty if any stored item is invalid. */
export function readStoredCart(): CartItem[] {
  try {
    return storedCartSchema.validateSync(
      localStorageAdapter.get<unknown>(cartKey),
    )
  } catch {
    return []
  }
}

/** Reuse the persisted key for identical retries; changed requests start a new attempt. */
export function getClientIdempotencyKey(payment: PaymentIntentRequest): string {
  const fingerprint = JSON.stringify(payment)
  const stored = sessionStorageAdapter.get<StoredPaymentIdempotency>(
    paymentIdempotencyKey,
  )

  if (stored?.fingerprint === fingerprint && stored.clientIdempotencyKey) {
    return stored.clientIdempotencyKey
  }

  const clientIdempotencyKey = crypto.randomUUID()
  sessionStorageAdapter.set(paymentIdempotencyKey, {
    fingerprint,
    clientIdempotencyKey,
  })

  return clientIdempotencyKey
}

/** Clear only the expected key, preserving a newer attempt's persisted key. */
export function clearClientIdempotencyKey(clientIdempotencyKey: string): void {
  const stored = sessionStorageAdapter.get<StoredPaymentIdempotency>(
    paymentIdempotencyKey,
  )

  if (stored?.clientIdempotencyKey === clientIdempotencyKey) {
    resetClientIdempotencyKey()
  }
}

/** Forget the attempt when checkout is explicitly reset or canceled. */
export function resetClientIdempotencyKey(): void {
  sessionStorageAdapter.remove(paymentIdempotencyKey)
}

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
