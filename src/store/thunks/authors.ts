import { createAsyncThunk } from '@reduxjs/toolkit'
import { getAuthorById, getAuthorsBySearch } from '@/api'

export const fetchAuthorById = createAsyncThunk(
  'authors/fetchAuthorById',
  getAuthorById,
)

export const fetchAuthorsBySearch = createAsyncThunk(
  'authors/fetchAuthorsBySearch',
  getAuthorsBySearch,
)
