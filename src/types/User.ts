import type { Address } from '@stripe/stripe-js'

export type User = {
  uuid: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: Address
  avatar?: File | string
  role?: 'user' | 'admin'
}

export type UserUpdate = Partial<User> & { password?: string }
export type UserLogin = Pick<User, 'email'> & { password: string }
export type UserRegister = Omit<User, 'uuid'> & { password: string }
