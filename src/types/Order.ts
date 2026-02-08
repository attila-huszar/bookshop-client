import { PaymentIntentShipping, PaymentIntentStatus } from './'
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
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: number
  author: string
  title: string
  price: number
  discount: number
  quantity: number
}

export type PaymentIntentRequest = {
  items: MinimalCart[]
}

export type PaymentIntentResponse = {
  client_secret: string
  amount: number
  status: PaymentIntentStatus
}

export type PaymentSession = {
  session: string
  amount: number
}
