import { IBook } from './IBook'
import { IAuthor } from './IAuthor'
import { SerializedError } from '@reduxjs/toolkit'

export interface IBookState {
  booksData: IBook[]
  booksIsLoading: boolean
  booksError: SerializedError | null
  randomBooks: IBook[]
}

export interface IAuthorState {
  authorsData: IAuthor[]
  authorsIsLoading: boolean
  authorsError: SerializedError | null
}
