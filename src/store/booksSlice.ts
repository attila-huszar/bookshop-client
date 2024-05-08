import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import {
  fetchBooks,
  getBookSearchOptions,
  getFilteredBooks,
} from '../api/fetchData'
import { IBookStore } from '../interfaces'
import { getRandomBooks } from '../utils/getRandomBooks'
import { IFilter } from '../interfaces/IFilter'

const initialState: IBookStore = {
  booksData: [],
  booksAreLoading: false,
  bookIsLoading: false,
  booksError: null,
  booksFilters: {
    available: {
      genre: [],
      price: [],
    },
    active: {
      genre: [],
      price: [],
    },
  },
  booksRandomized: [],
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
      state.booksFilters.active.price = action.payload
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
        state.booksFilters.available = action.payload
        state.booksFilters.active.price = action.payload.price
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
export const { getBooksRandomized, setBooksFilterGenre, setBooksFilterPrice } =
  booksSlice.actions
