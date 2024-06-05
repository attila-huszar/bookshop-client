import {
  createSlice,
  createAsyncThunk,
  SerializedError,
  PayloadAction,
} from '@reduxjs/toolkit'
import {
  getBooks,
  getBooksByProperty,
  getBookSearchOptions,
  getFilteredBooks,
} from 'api/fetchData'
import { getRandomBooks } from 'helpers'
import { IBookStore, IFilter } from 'interfaces'

const initialState: IBookStore = {
  booksData: [],
  booksViewed: [],
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
      .addCase(fetchBooks.pending, (state) => {
        state.booksAreLoading = true
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksData = action.payload
        state.booksAreLoading = false
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
        state.booksAreLoading = false
      })
      .addCase(fetchBookById.pending, (state) => {
        state.bookIsLoading = true
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        const bookExists = state.booksViewed.some(
          (book) => book.id === action.payload.id,
        )
        if (!bookExists) {
          state.booksViewed.push(action.payload)
        }
        state.bookIsLoading = false
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
        state.bookIsLoading = false
      })
      .addCase(fetchFilteredBooks.fulfilled, (state, action) => {
        state.booksData = action.payload
      })
      .addCase(fetchBookSearchOptions.fulfilled, (state, action) => {
        state.booksFilters.initial = {
          ...state.booksFilters.initial,
          ...action.payload,
        }
        state.booksFilters.active.price = action.payload.price
        state.booksFilters.active.publishYear = action.payload.publishYear
      })
      .addCase(fetchBooksByProperty.fulfilled, (state, action) => {
        if (action.meta.arg === 'topSellers') {
          state.booksTopSellers = action.payload
        } else if (action.meta.arg === 'new') {
          state.booksReleases = action.payload
        }
      })
  },
})

export const fetchBooks = createAsyncThunk(
  'fetchBooks',
  (_, { rejectWithValue }) => getBooks(_, rejectWithValue),
)

export const fetchBookById = createAsyncThunk(
  'fetchBookById',
  (id: string, { rejectWithValue }) => getBooks(id, rejectWithValue),
)

export const fetchBooksByProperty = createAsyncThunk(
  'fetchBooksByProperty',
  (property: string, { rejectWithValue }) =>
    getBooksByProperty(property, rejectWithValue),
)

export const fetchFilteredBooks = createAsyncThunk(
  'fetchFilteredBooks',
  (criteria: IFilter, { rejectWithValue }) =>
    getFilteredBooks(criteria, rejectWithValue),
)

export const fetchBookSearchOptions = createAsyncThunk(
  'fetchBookSearchOptions',
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
