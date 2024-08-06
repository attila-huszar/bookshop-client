import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { SerializedError } from '@reduxjs/toolkit'
import { getAuthorById, getAuthorsBySearch } from 'api/fetchData'
import { IAuthor, IAuthorStore } from 'interfaces'

const initialState: IAuthorStore = {
  authorArray: [],
  authorIsLoading: false,
  authorError: null,
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
        (author) => author.id === action.payload.id,
      )
      if (!authorExists) {
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
      state: { authorError: SerializedError | null; authorIsLoading: boolean },
      action: { payload: unknown },
    ) => {
      state.authorError = action.payload as SerializedError
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
  (id: number, { rejectWithValue }) => getAuthorById(id, rejectWithValue),
)

export const fetchAuthorsBySearch = createAsyncThunk(
  'fetchAuthorsBySearch',
  (searchString: string, { rejectWithValue }) =>
    getAuthorsBySearch(searchString, rejectWithValue),
)

export const authorsReducer = authorsSlice.reducer
