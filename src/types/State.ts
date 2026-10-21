import type { ApiError } from './ApiError'
import type { Cart } from './Cart'
import type { BookCriteria, Filters } from './Filters'
import type { PaymentCreateIssueCode, PaymentSession } from './Payment'

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
  cartItems: Cart[]
  cartError: string | null
  currentRequestId: string | null
}

export type PaymentState = {
  payment: PaymentSession | null
  paymentIsLoading: boolean
  paymentCreateError: string | ApiError | null
  paymentCreateIssueCode: PaymentCreateIssueCode | null
  paymentRetrieveError: string | ApiError | null
}
