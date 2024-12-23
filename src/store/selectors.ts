import type { RootState } from './store'
import type { Book } from '@/types'

export const booksSelector = (state: RootState) => state.books

export const bookByIdSelector = (id: string) => (state: RootState) => {
  const bookId = Number(id)
  const findBook = (books: Book[]) => books.find((book) => book.id === bookId)

  return (
    findBook(state.books.booksInShop) ??
    findBook(state.books.booksViewed) ??
    findBook(state.books.booksRecommended) ??
    findBook(state.books.booksTopSellers) ??
    findBook(state.books.booksReleases)
  )
}

export const authorsSelector = (state: RootState) => state.authors

export const authorByIdSelector = (id: number | null) => (state: RootState) =>
  state.authors.authorArray.find((author) => author.id === id)

export const newsSelector = (state: RootState) => state.news

export const userSelector = (state: RootState) => state.user

export const cartSelector = (state: RootState) => state.cart

export const orderSelector = (state: RootState) => state.order
