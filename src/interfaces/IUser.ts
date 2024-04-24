export interface IUser {
  uuid: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  createdAt?: Date
  updatedAt?: Date
  avatar?: string | File | null
  id?: number
}

export type IUserStore = Omit<IUser, 'password'>
