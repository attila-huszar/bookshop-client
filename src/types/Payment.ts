import type { MinimalCart } from './Cart'
import type { PaymentIntent, PaymentIntentStatus } from './Stripe'

export type PaymentIntentRequest = {
  items: MinimalCart[]
  expectedTotal: number
}

export type PaymentIntentResponse = Pick<
  PaymentIntent,
  | 'id'
  | 'client_secret'
  | 'amount'
  | 'status'
  | 'currency'
  | 'receipt_email'
  | 'shipping'
  | 'created'
>

export type PaymentSession = {
  paymentId: string
  paymentToken: string
  amount: number
}

export type PaymentCreateIssueCode = 'price_conflict' | 'unknown'

export type PaymentStatusState =
  | { type: PaymentIntentStatus | 'checking' }
  | { type: 'retry'; attempt: number; maxAttempts: number }
  | { type: 'failure'; details: string }
  | { type: 'timeout'; timeoutSeconds: number }
