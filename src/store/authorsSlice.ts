import { createSlice } from '@reduxjs/toolkit'
import { IBook } from '../interfaces'

const initialState: { data: IBook[] | undefined; error: Error | null } = {
  data: [],
  error: null,
}

export const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {
    authorsSuccess: (state, action) => {
      state.data = action.payload
    },
    authorsError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { authorsSuccess, authorsError } = authorsSlice.actions
