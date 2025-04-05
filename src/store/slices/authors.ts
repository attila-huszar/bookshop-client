import { createSlice, type SerializedError } from '@reduxjs/toolkit'
import { fetchAuthorById, fetchAuthorsBySearch } from '../thunks/authors'
import type { Author, AuthorState } from '@/types'

const initialState: AuthorState = {
  authorArray: [],
  authorIsLoading: false,
  authorError: undefined,
}

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const handlePending = (state: { authorIsLoading: boolean }) => {
      state.authorIsLoading = true
    }

    const handleFulfilledById = (
      state: { authorArray: Author[]; authorIsLoading: boolean },
      action: { payload: Author },
    ) => {
      const authorExists = state.authorArray.some(
        (author) => author.id === action.payload?.id,
      )
      if (!authorExists && action.payload) {
        state.authorArray.push(action.payload)
      }
      state.authorIsLoading = false
    }

    const handleFulfilledBySearch = (
      state: { authorArray: Author[]; authorIsLoading: boolean },
      action: { payload: Author[] },
    ) => {
      action.payload.forEach((newAuthor) => {
        if (
          !state.authorArray.some(
            (existingAuthor) => existingAuthor.id === newAuthor.id,
          )
        ) {
          state.authorArray.push(newAuthor)
        }
      })
      state.authorIsLoading = false
    }

    const handleRejected = (
      state: { authorError: string | undefined; authorIsLoading: boolean },
      action: { error: SerializedError },
    ) => {
      state.authorError = action.error.message
      state.authorIsLoading = false
    }

    builder
      .addCase(fetchAuthorById.pending, handlePending)
      .addCase(fetchAuthorById.fulfilled, handleFulfilledById)
      .addCase(fetchAuthorById.rejected, handleRejected)
      .addCase(fetchAuthorsBySearch.pending, handlePending)
      .addCase(fetchAuthorsBySearch.fulfilled, handleFulfilledBySearch)
      .addCase(fetchAuthorsBySearch.rejected, handleRejected)
  },
})

export const authorsReducer = authorsSlice.reducer
