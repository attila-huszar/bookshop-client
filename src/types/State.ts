import type {
  Book,
  Author,
  News,
  Cart,
  FilterProps,
  User,
  OrderInStore,
  BookInDB,
  UserInDB,
  OrderInDB,
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
  orderCancelError: string | null
}

export type CMSState = {
  users: UserInDB[]
  usersLoading: boolean
  usersError: string | null
  books: BookInDB[]
  booksLoading: boolean
  booksError: string | null
  authors: Author[]
  authorsLoading: boolean
  authorsError: string | null
  news: News[]
  newsLoading: boolean
  newsError: string | null
  orders: OrderInDB[]
  ordersLoading: boolean
  ordersError: string | null
}
