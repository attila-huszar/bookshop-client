import { OrderSyncIssueCode } from '@/types/Order'
import { PaymentIntentStatus } from '@/types/Stripe'

export const successStatuses: PaymentIntentStatus[] = [
  'succeeded',
  'requires_capture',
]

export const retryableStatuses: PaymentIntentStatus[] = [
  'processing',
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
]

export const orderSyncIssueCodes: OrderSyncIssueCode[] = [
  'timeout',
  'retryable',
  'unauthorized',
  'unknown',
]

export const retryableHttpStatuses = new Set([
  408, 425, 429, 500, 502, 503, 504,
])

export const timeoutHttpStatuses = new Set([408, 504])

export const ORDER_SYNC_RETRY_BASE_DELAY_MS = 1000
export const ORDER_SYNC_RETRY_MAX_DELAY_MS = 8000
export const MAX_ORDER_SYNC_RETRIES = 7
