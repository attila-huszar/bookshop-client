import { IBook, IAuthor, INews, ICart, IFilter, IStripeOrder, IUser } from './'

export interface IStateBook {
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

export interface IStateAuthor {
  authorArray: IAuthor[]
  authorIsLoading: boolean
  authorError: string | undefined
}

export interface IStateNews {
  newsArray: INews[]
  newsIsLoading: boolean
  newsError: string | undefined
}

export interface IStateUser {
  accessToken: string | null
  userData: IUser | null
  userIsLoading: boolean
  userIsUpdating: boolean
  userError: string | undefined
  loginError: string | undefined
  registerError: string | undefined
}

export interface IStateCart {
  cartArray: ICart[]
  cartIsLoading: boolean
  cartError: string | undefined
}

export interface IStateOrder {
  orderStatus: IStripeOrder | null
  orderIsLoading: boolean
  orderCreateError: string | undefined
  orderRetrieveError: string | undefined
}

export interface IStateAuth {
  accessToken: string | null
}
