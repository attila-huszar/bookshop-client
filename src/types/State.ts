import type { ApiError } from './ApiError'
import type { CartItem } from './Cart'
import type { BookCriteria, Filters } from './Filters'
import type { PaymentSession } from './Payment'

export type BooksState = {
  booksCurrentPage: number
  booksPerPage: number
  booksAppliedFilters: BookCriteria | undefined
  booksFilters: {
    initial: Filters
    active: Filters
  }
}

export type UserState = {
  accessToken: string | null
}

export type CartState = {
  cartItems: CartItem[]
}

export type PaymentState = {
  payment: PaymentSession | null
  phase: 'idle' | 'creating' | 'restoring' | 'ready' | 'canceling' | 'failed'
  operationId: string | null
  error: ApiError | null
}
