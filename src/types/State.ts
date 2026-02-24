import type { Author } from './Author'
import type { Book, BookWithAuthorId } from './Book'
import type { Cart } from './Cart'
import type { Filters } from './Filters'
import type { News } from './News'
import type {
  Order,
  OrderSyncIssueCode,
  OrderSyncResponse,
  PaymentSession,
} from './Order'
import type { User, UserWithMetadata } from './User'

export type BookState = {
  books: Book[]
  booksTotal: number
  booksCurrentPage: number
  booksPerPage: number
  booksOnCurrentPage: Book[]
  bookIsLoading: boolean
  booksError: string | null
  booksRecommended: Book[]
  booksTopSellers: Book[]
  booksReleases: Book[]
  booksFilters: {
    initial: Filters
    active: Filters
  }
}

export type AuthorState = {
  authorArray: Author[]
  authorIsLoading: boolean
  authorError: string | null
}

export type NewsState = {
  newsItems: News[]
  newsIsLoading: boolean
  newsError: string | null
}

export type UserState = {
  accessToken: string | null
  userData: User | null
  userIsLoading: boolean
  userIsUpdating: boolean
  tokenError: string | null
  userError: string | null
  loginError: string | null
  registerError: string | null
}

export type CartState = {
  cartItems: Cart[]
  cartIsLoading: boolean
  cartError: string | null
}

export type PaymentState = {
  payment: PaymentSession | null
  paymentIsLoading: boolean
  paymentCreateError: string | null
  paymentRetrieveError: string | null
  paymentCancelError: string | null
  orderSyncIsLoading: boolean
  orderSyncError: string | null
  orderSyncIssueCode: OrderSyncIssueCode | null
  orderSync: OrderSyncResponse | null
}

export type CMSState = {
  users: UserWithMetadata[]
  usersLoading: boolean
  usersError: string | null
  books: BookWithAuthorId[]
  booksLoading: boolean
  booksError: string | null
  authors: Author[]
  authorsLoading: boolean
  authorsError: string | null
  news: News[]
  newsLoading: boolean
  newsError: string | null
  orders: Order[]
  ordersLoading: boolean
  ordersError: string | null
}
