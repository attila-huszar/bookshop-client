import type { StripeAddress } from './Stripe'

export type User = {
  uuid: string
  firstName: string
  lastName: string
  email: string
  country: string
  phone: string | null
  address: StripeAddress | null
  avatar: string | null
  role: UserRole
}

/** Admin response adds account metadata without exposing credentials. */
export type CmsUser = User & {
  id: number
  verified: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
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

export type CmsUserCreate = Omit<User, 'uuid'> & {
  password: string
  verified: boolean
}

export type CmsUserUpdate = Pick<User, 'uuid'> &
  Partial<Omit<CmsUserCreate, 'password'>>

export type UserProfileUpdate = Partial<
  Pick<User, 'firstName' | 'lastName' | 'country' | 'phone' | 'address'>
> & {
  avatar?: null
  password?: string
  currentPassword?: string
}

export type CountryData = Record<string, string>
