import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { IBook } from '../interfaces'
import { URL } from '../lib/pathConstants'
import { RootState } from './store'

export const fetchBooks = createAsyncThunk('fetchBooks', async () => {
  const response = await axios.get(URL.books)
  return response.data
})

const initialState: {
  data: IBook[]
  status: string
  error: string | undefined
} = {
  data: [],
  status: 'idle',
  error: undefined,
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
        state.error = action.error.message
      })
  },
})

export const bookState = (state: RootState) => state.books
