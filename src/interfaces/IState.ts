import { IBook } from './IBook'
import { IAuthor } from './IAuthor'
import { SerializedError } from '@reduxjs/toolkit'

export interface IBookState {
  data: IBook[]
  isLoading: boolean
  error: SerializedError | null
}

export interface IAuthorState {
  data: IAuthor[]
  isLoading: boolean
  error: SerializedError | null
}
