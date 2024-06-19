import { SerializedError } from '@reduxjs/toolkit'
import { IBook, IAuthor, INews, IUserToStore, ICart, IFilter } from 'interfaces'

export interface IBookStore {
  booksInShop: IBook[]
  booksViewed: IBook[]
  booksTotal: number
  booksCurrentPage: number
  booksPerPage: number
  booksAreLoading: boolean
  booksError: SerializedError | null
  booksRecommended: IBook[]
  booksTopSellers: IBook[]
  booksReleases: IBook[]
  booksFilters: {
    initial: IFilter
    active: IFilter
  }
}

export interface IAuthorStore {
  authorArray: IAuthor[]
  authorIsLoading: boolean
  authorError: SerializedError | null
}

export interface INewsStore {
  newsArray: INews[]
  newsIsLoading: boolean
  newsError: SerializedError | null
}

export interface IUserStore {
  userData: IUserToStore | null
  userIsLoading: boolean
  userError: SerializedError | null
  loginError: SerializedError | null
  registerError: SerializedError | null
}

export interface ICartStore {
  cartArray: ICart[]
  cartIsLoading: boolean
  cartError: SerializedError | null
}
