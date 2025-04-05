import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  fetchBookById,
  fetchBooks,
  fetchBooksByAuthor,
  fetchBooksByProperty,
  fetchBooksBySearch,
  fetchBookSearchOptions,
  fetchRecommendedBooks,
} from '../thunks/books'
import type { Book, BookState, FilterProps } from '@/types'

const initialState: BookState = {
  booksInShop: [],
  booksViewed: [],
  booksTotal: 0,
  booksCurrentPage: 1,
  booksPerPage: 8,
  bookIsLoading: false,
  booksAreLoading: false,
  booksError: undefined,
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
    const handleViewedBooks = (
      state: { booksViewed: Book[] },
      action: { payload: Book[] },
    ) => {
      action.payload.forEach((newBook) => {
        if (
          !state.booksViewed.some(
            (existingBook) => existingBook.id === newBook.id,
          )
        ) {
          state.booksViewed.push(newBook)
        }
      })
    }

    builder
      .addCase(fetchBooks.pending, (state) => {
        state.booksError = undefined
        state.booksAreLoading = true
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksInShop = action.payload.books
        state.booksTotal = action.payload.total
        state.booksError = undefined
        state.booksAreLoading = false
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksError = action.error.message
        state.booksAreLoading = false
      })
      .addCase(fetchBookById.pending, (state) => {
        state.booksError = undefined
        state.bookIsLoading = true
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        const bookExists = state.booksViewed.some(
          (book) => book.id === action.payload?.id,
        )
        if (!bookExists && action.payload) {
          state.booksViewed.push(action.payload)
        }
        state.booksError = undefined
        state.bookIsLoading = false
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.error.message
        state.bookIsLoading = false
      })
      .addCase(fetchBooksByProperty.fulfilled, (state, action) => {
        if (action.meta.arg === 'topSellers') {
          state.booksTopSellers = action.payload
        } else if (action.meta.arg === 'newRelease') {
          state.booksReleases = action.payload
        }
      })
      .addCase(fetchBooksBySearch.fulfilled, handleViewedBooks)
      .addCase(fetchBooksByAuthor.fulfilled, handleViewedBooks)
      .addCase(fetchRecommendedBooks.fulfilled, (state, action) => {
        state.booksRecommended = action.payload
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
