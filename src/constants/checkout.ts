import { OrderSyncIssueCode } from '@/types/Order'
import { PaymentIntentStatus } from '@/types/Stripe'

export const stripeStatuses: PaymentIntentStatus[] = [
  'succeeded',
  'processing',
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'requires_capture',
  'canceled',
]

const successStatusSet = new Set<PaymentIntentStatus>([
  'succeeded',
  'requires_capture',
])

export const successStatuses: PaymentIntentStatus[] = stripeStatuses.filter(
  (status) => successStatusSet.has(status),
)

export const retryableStatuses: PaymentIntentStatus[] = stripeStatuses.filter(
  (status) => !successStatusSet.has(status) && status !== 'canceled',
)

export const orderSyncIssueCodes: OrderSyncIssueCode[] = [
  'timeout',
  'retryable',
  'unauthorized',
  'unknown',
]

export const UNAUTHORIZED_STATUS_CODES = [401, 403]
export const TIMEOUT_STATUS_CODES = [408, 504]
export const RETRYABLE_STATUS_CODES = [425, 429, 500, 502, 503]

export const ORDER_SYNC_RETRY_STATUS_CODES = [
  ...TIMEOUT_STATUS_CODES,
  ...RETRYABLE_STATUS_CODES,
]

export const ORDER_SYNC_RETRY_BASE_DELAY_MS = 1000
export const ORDER_SYNC_RETRY_MAX_DELAY_MS = 8000
export const ORDER_SYNC_MAX_RETRIES = 7
