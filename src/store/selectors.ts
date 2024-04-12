import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './store'

export const booksSelector = (state: RootState) => state.books

export const bookByIdSelector = (id: string) => (state: RootState) => {
  return state.books.booksData.find((book) => book.id === Number(id))
}

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
