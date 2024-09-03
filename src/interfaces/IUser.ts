import { type Address } from '@stripe/stripe-js'

export interface IUser {
  id?: number
  uuid: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  address: Address
  avatar: File | string | undefined
  role: 'user' | 'admin'
  verified: boolean
  verificationCode: string
  verificationCodeExpiresAt: Date
  passwordResetCode?: string
  passwordResetCodeExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type IUserToStore = Omit<
  IUser,
  'password' | 'verificationCode' | 'verificationCodeExpiresAt'
>

export interface IUserUpdate {
  uuid: string
  fields: Partial<IUser>
}
