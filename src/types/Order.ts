import { PaymentIntent, type Address } from '@stripe/stripe-js'

export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Captured = 'CAPTURED',
  Canceled = 'CANCELED',
}

export type Order = {
  paymentId: string
  paymentIntentStatus: PaymentIntent.Status
  orderStatus: OrderStatus
  total: number
  items: OrderItem[]
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: Partial<Address>
}

export type OrderInDB = Order & {
  id: number
  currency: string
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

export type OrderCreate = {
  items: {
    id: number
    quantity: number
  }[]
}

export type OrderInStore = {
  clientSecret: string
  amount: number
}

export type OrderUpdate = {
  paymentId: string
  fields: Partial<Order>
}

export type PaymentIntentResponse = {
  client_secret: string
  amount: number
  status: PaymentIntent.Status
}

export type OrderFormValues = Omit<OrderInDB, 'id' | 'createdAt' | 'updatedAt'>
