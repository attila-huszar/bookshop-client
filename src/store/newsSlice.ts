import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { SerializedError } from '@reduxjs/toolkit'
import { getNews } from 'api'
import { INewsStore } from 'interfaces'

const initialState: INewsStore = {
  newsArray: [],
  newsIsLoading: false,
  newsError: null,
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.newsIsLoading = true
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.newsIsLoading = false
        state.newsArray = action.payload
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.newsIsLoading = false
        state.newsError = action.payload as SerializedError
      })
  },
})

export const fetchNews = createAsyncThunk(
  'fetchNews',
  (_, { rejectWithValue }) => getNews(_, rejectWithValue),
)

export const newsReducer = newsSlice.reducer
