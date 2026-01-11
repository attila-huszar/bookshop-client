import { createSlice } from '@reduxjs/toolkit'
import { fetchNews } from '@/store/thunks/news'
import type { NewsState } from '@/types'

const initialState: NewsState = {
  newsItems: [],
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
        state.newsItems = action.payload
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.newsIsLoading = false
        state.newsError = action.error.message ?? 'Failed to fetch news'
      })
  },
})

export const newsReducer = newsSlice.reducer
