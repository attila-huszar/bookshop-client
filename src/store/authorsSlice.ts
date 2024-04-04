import axios, { AxiosError } from 'axios'
import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { IAuthors } from '../interfaces'
import { URL } from '../lib/pathConstants'
import { RootState } from './store'

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

const initialState: {
  data: IAuthors[]
  status: string
  error: SerializedError | null
} = {
  data: [],
  status: 'idle',
  error: null,
}

export const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.status = 'success'
        state.data = action.payload
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as SerializedError
      })
  },
})

export const authorState = (state: RootState) => state.authors
