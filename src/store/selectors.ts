import { RootState } from './store'

export const booksSelector = (state: RootState) => state.books
export const authorsSelector = (state: RootState) => state.authors
export const bookSelector = (id: string | undefined) => (state: RootState) => {
  return state.books.data.find((item) => item.id === id)
}
