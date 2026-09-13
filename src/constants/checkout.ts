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
