import { RootState } from './store'

export const booksSelector = (state: RootState) => state.books

export const authorsSelector = (state: RootState) => state.authors

export const bookByIdSelector =
  (id: string | undefined) => (state: RootState) => {
    return state.books.booksData.find((item) => item.id === Number(id))
  }

export const authorByIdSelector =
  (id: number | undefined) => (state: RootState) => {
    return state.authors.authorsData.find((item) => item.id === id)
  }
