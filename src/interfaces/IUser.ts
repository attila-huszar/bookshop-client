export interface IUser {
  id?: number
  uuid: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  address: IAddress
  avatar: string | File | null
  role: 'user' | 'admin'
  verified: boolean
  verificationCode: string
  verificationCodeExpiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface IAddress {
  street: string
  number: string
  city: string
  state: string
  postCode: string
  country: string
}

export type IUserToStore = Omit<
  IUser,
  'password' | 'verificationCode' | 'verificationCodeExpiresAt'
>

export interface IUserUpdate {
  uuid: string
  fields: Partial<IUser>
}
