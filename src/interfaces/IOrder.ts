import { PaymentIntent, type Address } from '@stripe/stripe-js'

export interface IOrder {
  id?: number
  paymentId: string
  orderStatus: 'pending' | 'paid' | 'cancelled'
  orderTotal: number
  orderCurrency: string
  orderItems: IOrderItem[]
  userName: string | null
  userEmail: string | null
  userPhone: string | null
  userAddress: Address
  orderCreatedAt: Date
  orderUpdatedAt: Date
}

export interface IOrderItem {
  id: number
  title: string
  price: number
  discount: number
  quantity: number
}

export interface IOrderUpdate {
  paymentId: string
  fields: Partial<IOrder>
}

export interface IStripePaymentIntent {
  amount: number
  currency: string
  description: string
}

export interface IStripeOrder {
  intent: PaymentIntent.Status
  paymentId: string
  clientSecret?: string
  amount: number
  currency: string
}

export interface ICreateOrder {
  orderToStripe: IStripePaymentIntent
  orderToServer: Pick<
    IOrder,
    | 'paymentId'
    | 'orderStatus'
    | 'orderTotal'
    | 'orderCurrency'
    | 'orderItems'
    | 'orderCreatedAt'
  >
}

export interface IRetrieveOrder {
  client_secret: string
  amount: number
  currency: string
}
