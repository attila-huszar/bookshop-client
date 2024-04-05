import axios, { AxiosError } from 'axios'
import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { IAuthorState } from '../interfaces'
import { URL } from '../lib/urlConstants'

export const fetchAuthors = createAsyncThunk(
  'fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(URL.authors)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return rejectWithValue(error.response.data)
      } else if (error instanceof AxiosError && error.message) {
        return rejectWithValue(error.message)
      } else {
        return rejectWithValue('Unknown error occurred')
      }
    }
  },
)

const initialState: IAuthorState = {
  data: [],
  isLoading: false,
  error: null,
}

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as SerializedError
      })
  },
})

export const authorsReducer = authorsSlice.reducer
