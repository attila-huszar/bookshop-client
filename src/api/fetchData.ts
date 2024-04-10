import axios, { AxiosError } from 'axios'
import { URL } from './urlConstants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchBooks = async (id: string | void, rejectWithValue: any) => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchAuthors = async (id: string | void, rejectWithValue: any) => {
  try {
    const response = await axios.get(id ? `${URL.authors}/${id}` : URL.authors)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}
