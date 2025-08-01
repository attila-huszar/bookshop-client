import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  fetchBookById,
  fetchBooks,
  fetchBooksByAuthor,
  fetchBooksByProperty,
  fetchBooksBySearch,
  fetchBookSearchOptions,
} from '../thunks/books'
import { addBooksToCache } from '../utils'
import type { BookState, FilterProps } from '@/types'

const initialState: BookState = {
  books: [],
  booksTotal: 0,
  booksCurrentPage: 1,
  booksPerPage: 8,
  booksOnCurrentPage: [],
  bookIsLoading: false,
  booksError: null,
  booksFilters: {
    initial: {
      genre: [],
      price: [],
      discount: 'allBooks',
      publishYear: [],
      rating: 0.5,
    },
    active: {
      genre: [],
      price: [],
      discount: 'allBooks',
      publishYear: [],
      rating: 0.5,
    },
  },
  booksRecommended: [],
  booksTopSellers: [],
  booksReleases: [],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    incrementBooksCurrentPage: (state) => {
      state.booksCurrentPage += 1
    },
    decrementBooksCurrentPage: (state) => {
      state.booksCurrentPage -= 1
    },
    setBooksCurrentPage: (state, action: PayloadAction<number>) => {
      state.booksCurrentPage = action.payload
    },
    setBooksFilterGenre: (state, action) => {
      if (typeof action.payload === 'string') {
        const genreIdx = state.booksFilters.active.genre.indexOf(action.payload)

        if (genreIdx !== -1) {
          state.booksFilters.active.genre.splice(genreIdx, 1)
        } else {
          state.booksFilters.active.genre.push(action.payload)
        }
      } else {
        state.booksFilters.active.genre = []
      }
    },
    setBooksFilterPrice: (
      state,
      action: PayloadAction<FilterProps['price']>,
    ) => {
      if (action.payload.length) {
        state.booksFilters.active.price = action.payload
      } else {
        state.booksFilters.active.price = state.booksFilters.initial.price
      }
    },
    setBooksFilterDiscount: (
      state,
      action: PayloadAction<FilterProps['discount']>,
    ) => {
      state.booksFilters.active.discount = action.payload
    },
    setBooksFilterPublishYear: (
      state,
      action: PayloadAction<FilterProps['publishYear']>,
    ) => {
      if (action.payload.length) {
        state.booksFilters.active.publishYear = action.payload
      } else {
        state.booksFilters.active.publishYear =
          state.booksFilters.initial.publishYear
      }
    },
    setBooksFilterRating: (
      state,
      action: PayloadAction<FilterProps['rating']>,
    ) => {
      state.booksFilters.active.rating = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.booksError = null
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        addBooksToCache(state, action.payload.books)
        state.booksOnCurrentPage = action.payload.books
        state.booksTotal = action.payload.total
        state.booksError = null
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksError = action.error.message ?? 'Failed to fetch books'
      })
      .addCase(fetchBookById.pending, (state) => {
        state.booksError = null
        state.bookIsLoading = true
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        addBooksToCache(state, action.payload)
        state.booksError = null
        state.bookIsLoading = false
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.error.message ?? 'Failed to fetch book'
        state.bookIsLoading = false
      })
      .addCase(fetchBooksByProperty.fulfilled, (state, action) => {
        addBooksToCache(state, action.payload)
        if (action.meta.arg === 'topSellers')
          state.booksTopSellers = action.payload
        if (action.meta.arg === 'newRelease')
          state.booksReleases = action.payload
        if (action.meta.arg === 'recommended')
          state.booksRecommended = action.payload
      })
      .addCase(fetchBooksBySearch.fulfilled, (state, action) => {
        addBooksToCache(state, action.payload)
      })
      .addCase(fetchBooksByAuthor.fulfilled, (state, action) => {
        addBooksToCache(state, action.payload)
      })
      .addCase(fetchBookSearchOptions.fulfilled, (state, action) => {
        state.booksFilters.initial = {
          ...state.booksFilters.initial,
          ...action.payload,
        }
        state.booksFilters.active.price = action.payload.price
        state.booksFilters.active.publishYear = action.payload.publishYear
      })
  },
})

export const booksReducer = booksSlice.reducer
export const {
  incrementBooksCurrentPage,
  decrementBooksCurrentPage,
  setBooksCurrentPage,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} = booksSlice.actions
