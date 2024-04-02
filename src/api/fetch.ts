import axios from 'axios'
import { IBook } from '../interfaces/IBook'

const url: Record<string, string> = {
  books: 'http://localhost:3004/books',
  authors: 'http://localhost:3004/authors',
}

export const fetchData = async (type: string): Promise<IBook[]> => {
  try {
    const response = await axios.get(url[type])
    return response.data
  } catch (error) {
    throw new Error((error as Error).message || 'Something went wrong')
  }
}
