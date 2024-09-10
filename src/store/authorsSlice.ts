import {
  createSlice,
  createAsyncThunk,
  type SerializedError,
} from '@reduxjs/toolkit'
import { getAuthorById, getAuthorsBySearch } from '@/api/rest'
import { IAuthor, IAuthorStore } from '@/interfaces'

const initialState: IAuthorStore = {
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
      state: { authorArray: IAuthor[]; authorIsLoading: boolean },
      action: { payload: IAuthor },
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
      state: { authorArray: IAuthor[]; authorIsLoading: boolean },
      action: { payload: IAuthor[] },
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

export const fetchAuthorById = createAsyncThunk(
  'fetchAuthorById',
  getAuthorById,
)

export const fetchAuthorsBySearch = createAsyncThunk(
  'fetchAuthorsBySearch',
  getAuthorsBySearch,
)

export const authorsReducer = authorsSlice.reducer
