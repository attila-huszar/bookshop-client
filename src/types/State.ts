import type {
  Book,
  Author,
  News,
  Cart,
  FilterProps,
  User,
  OrderInStore,
} from './'

export type BookState = {
  booksInShop: Book[]
  booksViewed: Book[]
  booksTotal: number
  booksCurrentPage: number
  booksPerPage: number
  bookIsLoading: boolean
  booksAreLoading: boolean
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
  newsArray: News[]
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
  cartArray: Cart[]
  cartIsLoading: boolean
  cartError: string | null
}

export type OrderState = {
  order: OrderInStore | null
  orderIsLoading: boolean
  orderCreateError: string | null
  orderRetrieveError: string | null
}
