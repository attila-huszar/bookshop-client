import axios, { AxiosError } from 'axios'
import { URL } from '../api/urlConstants'
import { createAsyncThunk } from '@reduxjs/toolkit'

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
