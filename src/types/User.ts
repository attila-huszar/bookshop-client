import type { StripeAddress } from './'

export type User = {
  uuid: string
  role: UserRole
  firstName: string
  lastName: string
  email: string
  country: string
  phone: string
  address: StripeAddress
  avatar: string
}

export type UserWithMetadata = User & {
  id: number
  verified: boolean
  verificationToken: string | null
  verificationExpires: string | null
  passwordResetToken: string | null
  passwordResetExpires: string | null
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  country: string
  avatar: File | null
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

export type UserUpdate = { uuid: string } & Partial<
  Omit<User, 'uuid' | 'createdAt' | 'updatedAt'>
> & {
    password?: string
  }

export type CountryData = Record<string, string>
