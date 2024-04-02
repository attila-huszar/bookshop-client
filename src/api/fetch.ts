import axios from 'axios'
import { IBook } from '../interfaces/IBook'

const url: Record<string, string> = {
  books: import.meta.env.VITE_URL_BOOKS,
  authors: import.meta.env.VITE_URL_AUTHORS,
}

export const fetchData = async (type: string): Promise<IBook[]> => {
  try {
    const response = await axios.get(url[type])
    return response.data
  } catch (error) {
    throw new Error((error as Error).message || 'Something went wrong')
  }
}
