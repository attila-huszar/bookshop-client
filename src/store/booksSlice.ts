import { createSlice, SerializedError } from '@reduxjs/toolkit'
import { fetchBooks } from '../api'
import { IBookState } from '../interfaces'

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
