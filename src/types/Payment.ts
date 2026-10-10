import type { MinimalCart } from './Cart'
import type { PaymentIntent } from './Stripe'

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
