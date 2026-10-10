import type { PaymentIntentShipping, PaymentIntentStatus } from './Stripe'

export type Order = {
  id: number
  paymentId: string | null
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
  imgUrl: string
  price: number
  discount: number
  quantity: number
}

export type CmsOrder = Order & { deletedAt: string | null }

export type CmsOrderUpdate = { paymentId: string } & Partial<
  Pick<Order, 'firstName' | 'lastName' | 'email' | 'shipping'>
>
