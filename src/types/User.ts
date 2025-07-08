import type { Address } from '@stripe/stripe-js'

export type User = {
  uuid: string
  role: UserRole
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  address?: Partial<Address>
  avatar?: string
}

export const enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  avatar?: File
}

export type RegisterResponse = {
  email: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  firstName: string
}

export type UserUpdate = Partial<User> & { password?: string }
