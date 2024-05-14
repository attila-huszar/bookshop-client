import {
  createSlice,
  createAsyncThunk,
  SerializedError,
  PayloadAction,
} from '@reduxjs/toolkit'
import {
  fetchBooks,
  fetchBooksByProperty,
  getBookSearchOptions,
  getFilteredBooks,
} from '../api/fetchData'
import { getRandomBooks } from '../utils'
import { IBookStore, IFilter } from '../interfaces'

const initialState: IBookStore = {
  booksData: [],
  booksAreLoading: false,
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
  booksRandomized: [],
  booksTopSellers: [],
  booksReleases: [],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    getBooksRandomized: (state) => {
      state.booksRandomized = getRandomBooks(state.booksData, 4)
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
    setBooksFilterPrice: (state, action) => {
      if (action.payload.length) {
        state.booksFilters.active.price = action.payload
      } else {
        state.booksFilters.active.price = state.booksFilters.initial.price
      }
    },
    setBooksFilterDiscount: (
      state,
      action: PayloadAction<IFilter['discount']>,
    ) => {
      state.booksFilters.active.discount = action.payload
    },
    setBooksFilterPublishYear: (state, action) => {
      if (action.payload.length) {
        state.booksFilters.active.publishYear = action.payload
      } else {
        state.booksFilters.active.publishYear =
          state.booksFilters.initial.publishYear
      }
    },
    setBooksFilterRating: (state, action: PayloadAction<IFilter['rating']>) => {
      state.booksFilters.active.rating = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBooks.pending, (state) => {
        state.booksAreLoading = true
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.booksData = action.payload
        state.booksAreLoading = false
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
        state.booksAreLoading = false
      })
      .addCase(fetchBookById.pending, (state) => {
        state.bookIsLoading = true
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.booksData = [...state.booksData, action.payload]
        state.bookIsLoading = false
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
        state.bookIsLoading = false
      })
      .addCase(filterBooks.fulfilled, (state, action) => {
        state.booksData = action.payload
      })
      .addCase(getSearchOptions.fulfilled, (state, action) => {
        state.booksFilters.initial = {
          ...state.booksFilters.initial,
          ...action.payload,
        }
        state.booksFilters.active.price = action.payload.price
        state.booksFilters.active.publishYear = action.payload.publishYear
      })
      .addCase(getBooksByProperty.fulfilled, (state, action) => {
        if (action.meta.arg === 'topSellers') {
          state.booksTopSellers = action.payload
        } else if (action.meta.arg === 'new') {
          state.booksReleases = action.payload
        }
      })
  },
})

export const fetchAllBooks = createAsyncThunk(
  'fetchAllBooks',
  (_, { rejectWithValue }) => fetchBooks(_, rejectWithValue),
)

export const fetchBookById = createAsyncThunk(
  'fetchBookById',
  (id: string, { rejectWithValue }) => fetchBooks(id, rejectWithValue),
)

export const getBooksByProperty = createAsyncThunk(
  'getBooksByProperty',
  (property: string, { rejectWithValue }) =>
    fetchBooksByProperty(property, rejectWithValue),
)

export const filterBooks = createAsyncThunk(
  'filterBooks',
  (criteria: IFilter, { rejectWithValue }) =>
    getFilteredBooks(criteria, rejectWithValue),
)

export const getSearchOptions = createAsyncThunk(
  'getSearchOptions',
  (_, { rejectWithValue }) => getBookSearchOptions(rejectWithValue),
)

export const booksReducer = booksSlice.reducer
export const {
  getBooksRandomized,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} = booksSlice.actions
