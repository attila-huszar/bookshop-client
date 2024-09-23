import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiHandler } from '@/api/apiHandler'
import { INewsStore } from '@/interfaces'

const initialState: INewsStore = {
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
        state.newsError = action.error.message
      })
  },
})

export const fetchNews = createAsyncThunk('fetchNews', apiHandler.getNews)

export const newsReducer = newsSlice.reducer
