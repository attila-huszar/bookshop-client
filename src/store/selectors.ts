import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './store'

export const booksSelector = (state: RootState) => state.books

export const bookByIdSelector = (id: string) => (state: RootState) => {
  return state.books.booksData.find((book) => book.id === Number(id))
}

export const bookLoadingSelector = (state: RootState) =>
  state.books.bookIsLoading

export const booksTopSellersSelector = createSelector(
  [booksSelector],
  (books) => {
    return books.booksData.filter((book) => book.topSellers)
  },
)

export const booksReleasesSelector = createSelector(
  [booksSelector],
  (books) => {
    return books.booksData.filter((book) => book.new)
  },
)

export const bookErrorSelector = (state: RootState) => state.books.booksError

export const authorsSelector = (state: RootState) => state.authors

export const authorByIdSelector = (id: number) => (state: RootState) =>
  state.authors.authorsData.find((author) => author.id === id)

export const authorErrorSelector = (state: RootState) =>
  state.authors.authorsError

export const newsSelector = (state: RootState) => state.news

export const newsErrorSelector = (state: RootState) => state.news.newsError

export const userSelector = (state: RootState) => state.user.userData

export const userVerifiedSelector = (state: RootState) =>
  state.user.userIsVerified

export const userErrorSelector = (state: RootState) => state.user.userError

export const loginErrorSelector = (state: RootState) => state.user.loginError

export const registerErrorSelector = (state: RootState) =>
  state.user.registerError

export const cartDataSelector = (state: RootState) => state.cart.cartData

export const cartLoadingSelector = (state: RootState) =>
  state.cart.cartIsLoading

export const cartErrorSelector = (state: RootState) => state.cart.cartError
