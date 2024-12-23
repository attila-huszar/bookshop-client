import { PaymentIntent, type Address } from '@stripe/stripe-js'

export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Cancelled = 'CANCELLED',
}

export type Order = {
  paymentId: string
  paymentIntentStatus: PaymentIntent.Status
  orderStatus: OrderStatus
  orderTotal: number
  orderCurrency: string
  orderItems: OrderItem[]
  userName?: string | null
  userFirstName?: string
  userLastName?: string
  userEmail?: string | null
  userPhone?: string | null
  userAddress?: Address
}

export type OrderItem = {
  id: number
  title: string
  price: number
  discount: number
  quantity: number
}

export type OrderInStore = {
  intent: PaymentIntent.Status
  status: OrderStatus
  paymentId: string
  clientSecret?: string
  amount: number
  currency: string
}

export type OrderUpdate = {
  paymentId: string
  fields: Partial<Order>
}

export type PostPaymentIntent = {
  amount: number
  currency: string
  description: string
}

export type GetPaymentIntent = {
  client_secret: string
  amount: number
  currency: string
}
