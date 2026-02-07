import { PaymentIntentShipping, PaymentIntentStatus } from './'
import type { CartItem } from './Cart'

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
}

export type OrderItem = {
  id: number
  title: string
  price: number
  discount: number
  quantity: number
}

export type OrderUpdate = Pick<
  Order,
  'paymentStatus' | 'firstName' | 'lastName' | 'email' | 'shipping'
>

export type OrderFormValues = Omit<Order, 'id'>

export type PaymentIntentRequest = {
  items: CartItem[]
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
