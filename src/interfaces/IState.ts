import {
  IBook,
  IAuthor,
  INews,
  IUserOmitPassword,
  ICart,
  IFilter,
} from '../interfaces'
import { SerializedError } from '@reduxjs/toolkit'

export interface IBookStore {
  booksData: IBook[]
  booksAreLoading: boolean
  bookIsLoading: boolean
  booksError: SerializedError | null
  booksRandomized: IBook[]
  booksTopSellers: IBook[]
  booksReleases: IBook[]
  booksFilters: {
    initial: IFilter
    active: IFilter
  }
}

export interface IAuthorStore {
  authorsData: IAuthor[]
  authorsIsLoading: boolean
  authorsError: SerializedError | null
}

export interface INewsStore {
  newsData: INews[]
  newsIsLoading: boolean
  newsError: SerializedError | null
}

export interface IUserStore {
  userData: IUserOmitPassword | null
  userIsVerified: boolean
  userIsLoading: boolean
  userError: SerializedError | null
  loginError: SerializedError | null
  registerError: SerializedError | null
}

export interface ICartStore {
  cartData: ICart[]
  cartIsLoading: boolean
  cartError: SerializedError | null
}
