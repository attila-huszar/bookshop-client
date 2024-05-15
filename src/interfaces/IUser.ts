export interface IUser {
  uuid: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  address?: Partial<IAddress>
  avatar?: string | File | null
  id?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface IAddress {
  street: string
  number: string
  city: string
  state: string
  postCode: string
  country: string
}

export type IUserOmitPassword = Omit<IUser, 'password'>

export interface IUserUpdate {
  uuid: string
  fields: Partial<IUser>
}
