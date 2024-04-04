import axios, { AxiosError } from 'axios'
import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { IBook } from '../interfaces'
import { URL } from '../lib/pathConstants'
import { RootState } from './store'

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

const initialState: {
  data: IBook[]
  status: string
  error: SerializedError | null
} = {
  data: [],
  status: 'idle',
  error: null,
}

export const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'success'
        state.data = action.payload
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as SerializedError
      })
  },
})

export const bookState = (state: RootState) => state.books
