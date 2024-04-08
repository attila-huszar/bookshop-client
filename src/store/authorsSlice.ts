import { createSlice, SerializedError } from '@reduxjs/toolkit'
import { fetchAuthors, fetchAuthorById } from '../api'
import { IAuthorState } from '../interfaces'

const initialState: IAuthorState = {
  authorsData: Array(50).fill({ id: 0, name: '' }),
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
        state.authorsData = [
          ...state.authorsData.slice(0, action.payload.id - 1),
          action.payload,
          ...state.authorsData.slice(action.payload.id),
        ]
      })
  },
})

export const authorsReducer = authorsSlice.reducer
