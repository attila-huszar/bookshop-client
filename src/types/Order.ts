import { PaymentIntent } from '@stripe/stripe-js'
import type { CartLocalStorage } from './Cart'

export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Captured = 'CAPTURED',
  Canceled = 'CANCELED',
}

export type Order = {
  id: number
  paymentId: string
  paymentIntentStatus: PaymentIntent.Status
  orderStatus: OrderStatus
  total: number
  currency: string
  items: OrderItem[]
  firstName: string | null
  lastName: string | null
  email: string | null
  shipping: PaymentIntent.Shipping | null
}

export type OrderItem = {
  id: number
  title: string
  price: number
  discount: number
  quantity: number
}

export type OrderCreate = {
  items: CartLocalStorage[]
}

export type OrderInStore = {
  paymentSession: string
  amount: number
}

export type OrderUpdate = Pick<
  Order,
  | 'paymentIntentStatus'
  | 'orderStatus'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'shipping'
>

export type PaymentIntentResponse = {
  client_secret: string
  amount: number
  status: PaymentIntent.Status
}

export type OrderFormValues = Omit<Order, 'id'>
