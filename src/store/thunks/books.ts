import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../store'
import {
  getAllBooks,
  getBookById,
  getBooks,
  getBooksByAuthor,
  getBooksByProperty,
  getBooksBySearch,
  getBookSearchOptions,
} from '@/api'
import { generateUniqueRndNums } from '@/helpers'
import type { Book, FilterProps, FilterActive } from '@/types'

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  (optionalFilters: FilterProps | undefined, { getState }) => {
    const {
      books: {
        booksCurrentPage: currentPage,
        booksPerPage: itemsPerPage,
        booksFilters: { active, initial },
      },
    } = getState() as RootState

    const isFilterActive: { [key in keyof FilterActive]: boolean } = {
      genre: active.genre.length > 0,
      priceMin: active.price[0] !== initial.price[0],
      priceMax: active.price[1] !== initial.price[1],
      discount: active.discount !== initial.discount,
      publishYearMin: active.publishYear[0] !== initial.publishYear[0],
      publishYearMax: active.publishYear[1] !== initial.publishYear[1],
      rating: active.rating !== initial.rating,
    }

    const hasAnyFilter = Object.values(isFilterActive).some(Boolean)

    const criteria: FilterActive | undefined =
      optionalFilters && hasAnyFilter
        ? {
            genre: isFilterActive.genre ? optionalFilters.genre : [],
            priceMin: isFilterActive.priceMin ? optionalFilters.price[0] : null,
            priceMax: isFilterActive.priceMax ? optionalFilters.price[1] : null,
            discount: isFilterActive.discount
              ? optionalFilters.discount
              : 'allBooks',
            publishYearMin: isFilterActive.publishYearMin
              ? optionalFilters.publishYear[0]
              : null,
            publishYearMax: isFilterActive.publishYearMax
              ? optionalFilters.publishYear[1]
              : null,
            rating: isFilterActive.rating ? optionalFilters.rating : 0.5,
          }
        : undefined

    return getBooks({ currentPage, itemsPerPage, criteria })
  },
)

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
  getBooksByProperty,
)

export const fetchRecommendedBooks = createAsyncThunk(
  'books/fetchRecommendedBooks',
  async (count: number, { getState }) => {
    const state = getState() as RootState
    const totalBooks: number = state.books.booksTotal
    const randomBooks: Book[] = []
    const randomIdxs = generateUniqueRndNums(count, totalBooks)

    for (const idx of randomIdxs) {
      const book = await getBookById(idx)
      if (book) {
        randomBooks.push(book)
      }
    }
    return randomBooks
  },
)

export const fetchBookSearchOptions = createAsyncThunk(
  'books/fetchBookSearchOptions',
  getBookSearchOptions,
)

export const fetchAllBooks = createAsyncThunk(
  'books/fetchAllBooks',
  async () => {
    const res = await getAllBooks()

    return res.map((r) => ({
      ...r.books,
      author: r.authors.name,
    }))
  },
)
