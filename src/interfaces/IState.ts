import { IBook, IAuthor, INews } from '.'
import { SerializedError } from '@reduxjs/toolkit'

export interface IBookState {
  booksData: IBook[]
  booksIsLoading: boolean
  booksError: SerializedError | null
  booksRandomize: IBook[]
}

export interface IAuthorState {
  authorsData: IAuthor[]
  authorsIsLoading: boolean
  authorsError: SerializedError | null
}

export interface INewsState {
  newsData: INews[]
  newsIsLoading: boolean
  newsError: SerializedError | null
}

export interface IUserState {
  userData: string
  userIsLoading: boolean
  userError: SerializedError | null
}
