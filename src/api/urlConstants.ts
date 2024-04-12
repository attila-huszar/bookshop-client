import { BOOKS, AUTHORS, NEWS } from '../routes/pathConstants'

export const URL: Record<string, string> = {
  books: `${import.meta.env.VITE_BASE_URL}/${BOOKS}`,
  authors: `${import.meta.env.VITE_BASE_URL}/${AUTHORS}`,
  news: `${import.meta.env.VITE_BASE_URL}/${NEWS}`,
}
