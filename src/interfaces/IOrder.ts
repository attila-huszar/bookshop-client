import { Address } from '@stripe/stripe-js'

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
