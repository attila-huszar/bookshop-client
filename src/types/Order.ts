import { PaymentIntent, type Address } from '@stripe/stripe-js'

export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Canceled = 'CANCELED',
}

export type Order = {
  paymentId: string
  paymentIntentStatus: PaymentIntent.Status
  orderStatus: OrderStatus
  total: number
  items: OrderItem[]
  name?: string | null
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  address?: Partial<Address>
}

export type OrderInDB = Order & {
  id: number
  createdAt: string
  updatedAt: string
}

export type OrderItem = {
  id: number
  title: string
  price: number
  discount: number
  quantity: number
}

export type OrderItemRequest = {
  id: number
  quantity: number
}

export type OrderCreateRequest = {
  items: OrderItemRequest[]
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  address?: Partial<Address> | null
}

export type OrderInStore = {
  clientSecret: string
  amount: number
  intent: PaymentIntent.Status
  status: OrderStatus
}

export type OrderUpdate = {
  paymentId: string
  fields: Partial<Order>
}

export type PostPaymentIntent = {
  amount: number
  description: string
}

export type GetPaymentIntent = {
  client_secret: string
  amount: number
  status: PaymentIntent.Status
}

export type OrderFormValues = Omit<Order, 'id'>
