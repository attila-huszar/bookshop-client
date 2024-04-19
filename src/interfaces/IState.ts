import { IBook, IAuthor, INews, IUserStore } from '.'
import { SerializedError } from '@reduxjs/toolkit'

export interface IBookStoreState {
  booksData: IBook[]
  booksIsLoading: boolean
  booksError: SerializedError | null
  booksRandomize: IBook[]
}

export interface IAuthorStoreState {
  authorsData: IAuthor[]
  authorsIsLoading: boolean
  authorsError: SerializedError | null
}

export interface INewsStoreState {
  newsData: INews[]
  newsIsLoading: boolean
  newsError: SerializedError | null
}

export interface IUserStoreState {
  userData: IUserStore | null
  userIsLoading: boolean
  userError: SerializedError | null
}
