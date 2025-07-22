import type {
  Book,
  Author,
  News,
  Cart,
  FilterProps,
  User,
  OrderInStore,
  BookResponse,
  UserResponse,
  OrderResponse,
} from './'

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
    initial: FilterProps
    active: FilterProps
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

export type OrderState = {
  order: OrderInStore | null
  orderIsLoading: boolean
  orderCreateError: string | null
  orderRetrieveError: string | null
}

export type CMSState = {
  users: UserResponse[]
  usersIsLoading: boolean
  usersError: string | null
  books: BookResponse[]
  booksIsLoading: boolean
  booksError: string | null
  authors: Author[]
  authorsIsLoading: boolean
  authorsError: string | null
  news: News[]
  newsIsLoading: boolean
  newsError: string | null
  orders: OrderResponse[]
  ordersIsLoading: boolean
  ordersError: string | null
}
