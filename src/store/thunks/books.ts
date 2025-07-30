import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../store'
import {
  getBookById,
  getBooks,
  getBooksByAuthor,
  getBooksByProperty,
  getBooksBySearch,
  getBookSearchOptions,
} from '@/api'
import { getFilteredResults } from '../utils'
import { generateUniqueRndNums } from '@/helpers'
import type { Book, FilterProps } from '@/types'

export const fetchBooks = createAsyncThunk<
  { books: Book[]; total: number },
  FilterProps | undefined,
  { state: RootState }
>('books/fetchBooks', (optionalFilters, { getState }) => {
  const currentPage = getState().books.booksCurrentPage
  const itemsPerPage = getState().books.booksPerPage
  const criteria = getFilteredResults(optionalFilters)

  return getBooks({ currentPage, itemsPerPage, criteria })
})

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  getBookById,
)

export const fetchBooksBySearch = createAsyncThunk(
  'books/fetchBooksBySearch',
  getBooksBySearch,
)

export const fetchBooksByAuthor = createAsyncThunk(
  'books/fetchBooksByAuthor',
  getBooksByAuthor,
)

export const fetchBooksByProperty = createAsyncThunk(
  'books/fetchBooksByProperty',
  async (
    property: 'newRelease' | 'topSellers' | 'recommended',
    { dispatch },
  ) => {
    if (property === 'recommended') {
      return await dispatch(fetchRecommendedBooks(4)).unwrap()
    }

    return getBooksByProperty(property)
  },
)

const fetchRecommendedBooks = createAsyncThunk(
  'books/fetchRecommendedBooks',
  async (count: number, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const totalBooks = state.books.booksTotal
    const randomBooks: Book[] = []
    const randomIdxs = generateUniqueRndNums(count, totalBooks)

    for (const idx of randomIdxs) {
      const existingBook = state.books.books.find((book) => book.id === idx)
      if (existingBook) {
        randomBooks.push(existingBook)
      } else {
        const book = await getBookById(idx)
        if (book) randomBooks.push(book)
      }
    }
    return randomBooks
  },
)

export const fetchBookSearchOptions = createAsyncThunk(
  'books/fetchBookSearchOptions',
  getBookSearchOptions,
)
