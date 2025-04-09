import { createAsyncThunk } from '@reduxjs/toolkit'
import { getNews } from '@/api'

export const fetchNews = createAsyncThunk('news/fetchNews', getNews)
