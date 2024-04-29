import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { fetchBooks } from '../api/fetchData'
import { IBookStore } from '../interfaces'
import { getRandomBooks } from '../utils/getRandomBooks'

const initialState: IBookStore = {
  booksData: [],
  booksAreLoading: false,
  bookIsLoading: false,
  booksError: null,
  booksRandomize: [],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    booksRandomize: (state) => {
      state.booksRandomize = getRandomBooks(state.booksData, 4)
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

export const booksReducer = booksSlice.reducer
export const { booksRandomize } = booksSlice.actions
