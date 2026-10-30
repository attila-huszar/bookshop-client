import type { CartItem } from './Cart'
import type { PaymentIntent, PaymentIntentStatus } from './Stripe'

export type PaymentIntentRequest = {
  items: CartItem[]
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

export type PaymentStatusState =
  | { type: PaymentIntentStatus | 'checking' }
  | { type: 'retry'; attempt: number; maxAttempts: number }
  | { type: 'failure'; details: string }
  | { type: 'timeout'; timeoutSeconds: number }
