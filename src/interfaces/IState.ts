import { PaymentIntent } from '@stripe/stripe-js'
import { IBook, IAuthor, INews, IUserToStore, ICart, IFilter } from 'interfaces'

export interface IBookStore {
  booksInShop: IBook[]
  booksViewed: IBook[]
  booksTotal: number
  booksCurrentPage: number
  booksPerPage: number
  bookIsLoading: boolean
  booksAreLoading: boolean
  booksError: string | undefined
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
  authorError: string | undefined
}

export interface INewsStore {
  newsArray: INews[]
  newsIsLoading: boolean
  newsError: string | undefined
}

export interface IUserStore {
  userData: IUserToStore | null
  userIsLoading: boolean
  userIsUpdating: boolean
  userError: string | undefined
  loginError: string | undefined
  registerError: string | undefined
}

export interface ICartStore {
  cartArray: ICart[]
  cartIsLoading: boolean
  cartError: string | undefined
}

export interface IOrderStore {
  orderStatus: {
    intent: PaymentIntent.Status | null
    clientSecret: string | undefined
    amount: number | null
    currency: string | null
  }
  orderIsLoading: boolean
  orderError: string | undefined
}
