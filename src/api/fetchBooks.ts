import axios, { AxiosError } from 'axios'
import { URL } from '../api/urlConstants'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchBooks = createAsyncThunk(
  'fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(URL.books)
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

export const fetchBookById = createAsyncThunk(
  'fetchBookById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${URL.books}/${id}`)
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
