import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { fetchNews } from 'api/fetchData'
import { INewsStore } from 'interfaces'

const initialState: INewsStore = {
  newsData: [],
  newsIsLoading: false,
  newsError: null,
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNews.pending, (state) => {
        state.newsIsLoading = true
      })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.newsIsLoading = false
        state.newsData = action.payload
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.newsIsLoading = false
        state.newsError = action.payload as SerializedError
      })
  },
})

export const fetchAllNews = createAsyncThunk(
  'fetchAllNews',
  (_, { rejectWithValue }) => fetchNews(_, rejectWithValue),
)

export const newsReducer = newsSlice.reducer
