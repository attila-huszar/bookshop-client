import { RootState } from './store'

export const booksSelector = (state: RootState) => state.books

export const bookByIdSelector = (id: string) => (state: RootState) =>
  state.books.booksData.find((book) => book.id === Number(id))

export const authorsSelector = (state: RootState) => state.authors

export const authorByIdSelector = (id: number) => (state: RootState) =>
  state.authors.authorsData.find((author) => author.id === id)

export const newsSelector = (state: RootState) => state.news

export const userSelector = (state: RootState) => state.user

export const cartSelector = (state: RootState) => state.cart
