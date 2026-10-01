import type { StripeAddress } from './Stripe'

export type User = {
  firstName: string
  lastName: string
  email: string
  country: string
  phone: string | null
  address: StripeAddress | null
  avatar: string | null
  role: UserRole
}

export type UserWithMetadata = User & {
  id: number
  uuid: string
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

export type UserUpdate = Partial<User> & {
  uuid?: string
  verified?: boolean
}

export type UserCreate = User & {
  password: string
  verified: boolean
}

export type UserProfileUpdate = Partial<
  Pick<User, 'firstName' | 'lastName' | 'country' | 'phone' | 'address'>
> & {
  avatar?: null
  password?: string
  currentPassword?: string
}

export type CountryData = Record<string, string>
