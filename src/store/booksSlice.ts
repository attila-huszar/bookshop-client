import { createSlice, SerializedError } from '@reduxjs/toolkit'
import { fetchBooks } from '../api'
import { IBookState } from '../interfaces'
import { getRandomBooks } from '../utils/shuffleBooks'

const initialState: IBookState = {
  booksData: [],
  booksIsLoading: false,
  booksError: null,
  randomBooks: [],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    randomBooks: (state) => {
      state.randomBooks = getRandomBooks(state.booksData, 4)
    },
  },
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
export const { randomBooks } = booksSlice.actions
