import type { Address } from '@stripe/stripe-js'

export type User = {
  uuid: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  address?: Address | object
  avatar?: string
  role?: USER_ROLE
}

export const enum USER_ROLE {
  USER = 'user',
  ADMIN = 'admin',
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
