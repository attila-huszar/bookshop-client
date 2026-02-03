import { PaymentIntentShipping, PaymentIntentStatus } from './'
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
  paymentStatus: PaymentIntentStatus
  total: number
  currency: string
  items: OrderItem[]
  firstName: string
  lastName: string
  email: string
  shipping: PaymentIntentShipping
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
  'paymentStatus' | 'firstName' | 'lastName' | 'email' | 'shipping'
>

export type PaymentIntentResponse = {
  client_secret: string
  amount: number
  status: PaymentIntentStatus
}

export type OrderFormValues = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
