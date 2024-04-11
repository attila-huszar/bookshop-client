import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { fetchBooks } from '../api/fetchData'
import { IBookState } from '../interfaces'
import { getRandomBooks } from '../utils/getRandomBooks'

const initialState: IBookState = {
  booksData: [],
  booksIsLoading: false,
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
        state.booksIsLoading = true
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.booksIsLoading = false
        state.booksData = action.payload
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.booksIsLoading = false
        state.booksError = action.payload as SerializedError
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.booksData = [...state.booksData, action.payload]
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
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
