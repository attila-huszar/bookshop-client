import { createSlice } from '@reduxjs/toolkit'
import { IBook } from '../interfaces'

const initialState: { data: IBook[] | undefined; error: string | null } = {
  data: [],
  error: null,
}

export const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    booksSuccess: (state, action) => {
      state.data = action.payload
    },
    booksError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { booksSuccess, booksError } = booksSlice.actions
