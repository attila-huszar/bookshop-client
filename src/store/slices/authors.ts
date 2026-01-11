import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchAuthorById, fetchAuthorsBySearch } from '@/store/thunks/authors'
import type { Author, AuthorState } from '@/types'

const initialState: AuthorState = {
  authorArray: [],
  authorIsLoading: false,
  authorError: null,
}

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const handlePending = (state: AuthorState) => {
      state.authorIsLoading = true
    }

    const handleFulfilledById = (
      state: AuthorState,
      action: PayloadAction<Author>,
    ) => {
      const authorExists = state.authorArray.some(
        (author) => author.id === action.payload.id,
      )
      if (!authorExists && action.payload) {
        state.authorArray.push(action.payload)
      }
      state.authorIsLoading = false
    }

    const handleFulfilledBySearch = (
      state: AuthorState,
      action: PayloadAction<Author[]>,
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
      state: AuthorState,
      action:
        | ReturnType<typeof fetchAuthorById.rejected>
        | ReturnType<typeof fetchAuthorsBySearch.rejected>,
    ) => {
      state.authorError = action.error.message ?? 'Failed to fetch authors'
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
