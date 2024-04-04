import { RootState } from './store'

export const booksSelector = (state: RootState) => state.books
export const authorsSelector = (state: RootState) => state.authors
