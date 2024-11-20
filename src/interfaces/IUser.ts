import { type Address } from '@stripe/stripe-js'

export interface IUser {
  uuid?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: Address
  avatar?: File | string
  role?: 'user' | 'admin'
}

export type IUserUpdate = Partial<IUser> & { password?: string }
