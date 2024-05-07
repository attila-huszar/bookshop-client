import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { fetchBooks, getFilteredBooks } from '../api/fetchData'
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
    },
    active: {
      genre: [],
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
    getBooksFilters: (state) => {
      const genres = [...new Set(state.booksData.map((book) => book.genre))]
      state.booksFilters.available.genre = genres
    },
    setBooksFilters: (state, action) => {
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

export const booksReducer = booksSlice.reducer
export const { getBooksRandomized, getBooksFilters, setBooksFilters } =
  booksSlice.actions
