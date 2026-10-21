import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BooksState, Filters } from '@/types'
import { bookshopApi } from '../api/bookshopApi'
import { buildBookCriteria } from '../api/booksQuery'

const initialState: BooksState = {
  booksAppliedFilters: undefined,
  booksCurrentPage: 1,
  booksPerPage: 8,
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
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    applyBooksFilters: (state, action: PayloadAction<Filters | undefined>) => {
      state.booksAppliedFilters = buildBookCriteria(
        state.booksFilters.initial,
        action.payload,
      )
      state.booksCurrentPage = 1
    },
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
    setBooksFilterPrice: (state, action: PayloadAction<Filters['price']>) => {
      if (action.payload.length) {
        state.booksFilters.active.price = action.payload
      } else {
        state.booksFilters.active.price = state.booksFilters.initial.price
      }
    },
    setBooksFilterDiscount: (
      state,
      action: PayloadAction<Filters['discount']>,
    ) => {
      state.booksFilters.active.discount = action.payload
    },
    setBooksFilterPublishYear: (
      state,
      action: PayloadAction<Filters['publishYear']>,
    ) => {
      if (action.payload.length) {
        state.booksFilters.active.publishYear = action.payload
      } else {
        state.booksFilters.active.publishYear =
          state.booksFilters.initial.publishYear
      }
    },
    setBooksFilterRating: (state, action: PayloadAction<Filters['rating']>) => {
      state.booksFilters.active.rating = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      bookshopApi.endpoints.searchOptions.matchFulfilled,
      (state, action) => {
        const firstLoad = state.booksFilters.initial.price.length === 0

        state.booksFilters.initial = {
          ...state.booksFilters.initial,
          ...action.payload,
        }

        if (firstLoad) {
          state.booksFilters.active.price = action.payload.price
          state.booksFilters.active.publishYear = action.payload.publishYear
        }
      },
    )
  },
})

export const booksReducer = booksSlice.reducer
export const {
  applyBooksFilters,
  incrementBooksCurrentPage,
  decrementBooksCurrentPage,
  setBooksCurrentPage,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} = booksSlice.actions
