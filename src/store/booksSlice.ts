import axios, { AxiosError } from 'axios'
import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { IBookState } from '../interfaces'
import { URL } from '../lib/urlConstants'

export const fetchBooks = createAsyncThunk(
  'fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(URL.books)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        throw rejectWithValue(error.message)
      } else {
        throw rejectWithValue('Unknown error occurred')
      }
    }
  },
)

export const fetchBookById = createAsyncThunk(
  'fetchBookById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${URL.books}/${id}`)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        throw rejectWithValue(error.message)
      } else {
        throw rejectWithValue('Unknown error occurred')
      }
    }
  },
)

const initialState: IBookState = {
  booksData: [],
  booksIsLoading: false,
  booksError: null,
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.booksIsLoading = true
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksIsLoading = false
        state.booksData = action.payload
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksIsLoading = false
        state.booksError = action.payload as SerializedError
      })
  },
})

export const booksReducer = booksSlice.reducer
