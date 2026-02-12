import { Book, BookState } from '@/types'

export const addBooksToCache = (state: BookState, newBooks: Book | Book[]) => {
  const booksArray = Array.isArray(newBooks) ? newBooks : [newBooks]
  const existingIds = new Set(state.books.map((book) => book.id))

  const uniqueBooks = booksArray.filter(
    (newBook) => !existingIds.has(newBook.id),
  )
  state.books.push(...uniqueBooks)
}
