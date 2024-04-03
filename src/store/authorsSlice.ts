import { createSlice } from '@reduxjs/toolkit'
import { IAuthors } from '../interfaces'

const initialState: { data: IAuthors[] | undefined; error: Error | null } = {
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
