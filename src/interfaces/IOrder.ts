import { PaymentIntent, type Address } from '@stripe/stripe-js'

export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Cancelled = 'CANCELLED',
}

export interface IOrder {
  paymentId: string
  paymentIntentStatus: PaymentIntent.Status
  orderStatus: OrderStatus
  orderTotal: number
  orderCurrency: string
  orderItems: IOrderItem[]
  userName?: string | null
  userFirstName?: string
  userLastName?: string
  userEmail?: string | null
  userPhone?: string | null
  userAddress?: Address
}

export interface IOrderItem {
  id: number
  title: string
  price: number
  discount: number
  quantity: number
}

export interface IOrderInStore {
  intent: PaymentIntent.Status
  status: OrderStatus
  paymentId: string
  clientSecret?: string
  amount: number
  currency: string
}

export interface IOrderUpdate {
  paymentId: string
  fields: Partial<IOrder>
}

export interface IPostPaymentIntent {
  amount: number
  currency: string
  description: string
}

export interface IGetPaymentIntent {
  client_secret: string
  amount: number
  currency: string
}
