import axios, { AxiosError } from 'axios'
import { URL } from './urlConstants'

export const fetchBooks = async (
  id: string | void,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(id ? `${URL.books}/${id}` : URL.books)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const fetchAuthors = async (
  id: string | void,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(id ? `${URL.authors}/${id}` : URL.authors)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue(
        id ? 'Unable to display author' : 'Unknown error occurred',
      )
    }
  }
}

export const fetchNews = async (
  id: string | void,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(id ? `${URL.news}/${id}` : URL.news)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}
