import axios, { AxiosError } from 'axios'
import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { IBookState } from '../interfaces'
import { URL } from '../lib/pathConstants'

export const fetchBooks = createAsyncThunk(
  'fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(URL.books)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return rejectWithValue(error.response.data)
      } else if (error instanceof AxiosError && error.message) {
        return rejectWithValue(error.message)
      } else {
        return rejectWithValue('Unknown error occurred')
      }
    }
  },
)

const initialState: IBookState = {
  data: [],
  isLoading: false,
  error: null,
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as SerializedError
      })
  },
})

export const booksReducer = booksSlice.reducer
