import { createSlice } from '@reduxjs/toolkit'
import { fetchNews } from '../thunks/news'
import type { NewsState } from '@/types'

const initialState: NewsState = {
  newsArray: [],
  newsIsLoading: false,
  newsError: undefined,
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
        state.newsError = action.error?.message
      })
  },
})

export const newsReducer = newsSlice.reducer
