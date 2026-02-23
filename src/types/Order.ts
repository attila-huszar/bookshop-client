import { PaymentIntent, PaymentIntentShipping, PaymentIntentStatus } from './'
import type { MinimalCart } from './Cart'

export type Order = {
  id: number
  paymentId: string
  paymentStatus: PaymentIntentStatus
  total: number
  currency: string
  items: OrderItem[]
  firstName: string | null
  lastName: string | null
  email: string | null
  shipping: PaymentIntentShipping | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type OrderItem = {
  id: number
  author: string | null
  title: string
  price: number
  discount: number
  quantity: number
}

export type OrderUpdate = { paymentId: string } & Partial<
  Omit<Order, 'paymentId' | 'id' | 'createdAt' | 'updatedAt' | 'paidAt'>
>

export type PaymentIntentRequest = {
  items: MinimalCart[]
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

export type OrderSyncResult = {
  paymentId: string
  paymentStatus: PaymentIntentStatus
  amount: number
  currency: string
  receiptEmail: string | null
  shipping: PaymentIntentShipping | null
  finalizedAt: string | null
}
