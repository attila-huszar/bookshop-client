import { RootState } from './store'
import { IBook } from '../interfaces'

export const booksSelector = (state: RootState) => state.books

export const bookByIdSelector = (id: string) => (state: RootState) => {
  const bookId = Number(id)
  const findBook = (books: IBook[]) => books.find((book) => book.id === bookId)

  return findBook(state.books.booksData) || findBook(state.books.booksViewed)
}

export const authorsSelector = (state: RootState) => state.authors

export const authorByIdSelector = (id: number) => (state: RootState) =>
  state.authors.authorsData.find((author) => author.id === id)

export const newsSelector = (state: RootState) => state.news

export const userSelector = (state: RootState) => state.user

export const cartSelector = (state: RootState) => state.cart
