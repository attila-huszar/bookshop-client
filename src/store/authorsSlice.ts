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
      if (error instanceof AxiosError) {
        throw rejectWithValue(error.message)
      } else {
        throw rejectWithValue('Unknown error occurred')
      }
    }
  },
)

export const fetchAuthorById = createAsyncThunk(
  'fetchAuthorById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${URL.authors}/${id}`)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        throw rejectWithValue(error.message)
      } else {
        throw rejectWithValue('Unable to get author')
      }
    }
  },
)

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
