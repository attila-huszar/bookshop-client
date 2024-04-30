import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { fetchAuthors } from '../api/fetchData'
import { IAuthorStore } from '../interfaces'

const initialState: IAuthorStore = {
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
      .addCase(fetchAllAuthors.pending, (state) => {
        state.authorsIsLoading = true
      })
      .addCase(fetchAllAuthors.fulfilled, (state, action) => {
        state.authorsIsLoading = false
        state.authorsData = action.payload
      })
      .addCase(fetchAllAuthors.rejected, (state, action) => {
        state.authorsIsLoading = false
        state.authorsError = action.payload as SerializedError
      })
      .addCase(fetchAuthorById.fulfilled, (state, action) => {
        state.authorsData = [...state.authorsData, action.payload]
      })
      .addCase(fetchAuthorById.rejected, (state, action) => {
        state.authorsError = action.payload as SerializedError
      })
  },
})

export const fetchAllAuthors = createAsyncThunk(
  'fetchAllAuthors',
  (_, { rejectWithValue }) => fetchAuthors(_, rejectWithValue),
)

export const fetchAuthorById = createAsyncThunk(
  'fetchAuthorById',
  (id: string, { rejectWithValue }) => fetchAuthors(id, rejectWithValue),
)

export const authorsReducer = authorsSlice.reducer
