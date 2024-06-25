import { IAddress } from './IUser'

export interface IOrder {
  id?: number
  paymentId: string
  userId: number
  userFirstName: string
  userLastName: string
  userEmail: string
  userAddress: IAddress
  userPhone: string
  orderStatus: 'pending' | 'paid' | 'cancelled'
  orderItems: IOrderItem[]
  orderTotal: number
  orderCurrency: string
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
