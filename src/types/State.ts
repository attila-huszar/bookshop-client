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
  booksError: string | undefined
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
  authorError: string | undefined
}

export type NewsState = {
  newsArray: News[]
  newsIsLoading: boolean
  newsError: string | undefined
}

export type UserState = {
  accessToken: string | null
  userData: User | null
  userIsLoading: boolean
  userIsUpdating: boolean
  tokenError: string | undefined
  userError: string | undefined
  loginError: string | undefined
  registerError: string | undefined
}

export type CartState = {
  cartArray: Cart[]
  cartIsLoading: boolean
  cartError: string | undefined
}

export type OrderState = {
  order: OrderInStore | null
  orderIsLoading: boolean
  orderCreateError: string | undefined
  orderRetrieveError: string | undefined
}
