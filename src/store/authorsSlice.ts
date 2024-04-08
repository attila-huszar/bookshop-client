import { createSlice, SerializedError } from '@reduxjs/toolkit'
import { fetchAuthors, fetchAuthorById } from '../api'
import { IAuthorState } from '../interfaces'

const initialState: IAuthorState = {
  authorsData: [],
  authorsIsLoading: false,
  authorsError: null,
}

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.authorsIsLoading = true
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.authorsIsLoading = false
        state.authorsData = action.payload
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.authorsIsLoading = false
        state.authorsError = action.payload as SerializedError
      })
      .addCase(fetchAuthorById.fulfilled, (state, action) => {
        state.authorsData = [...state.authorsData, action.payload]
      })
  },
})

export const authorsReducer = authorsSlice.reducer
