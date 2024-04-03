import axios from 'axios'
import { URL } from '../lib/pathConstants'
import { IBook } from '../interfaces/IBook'

export const fetchData = async (type: string): Promise<IBook[]> => {
  try {
    const response = await axios.get(URL[type])
    return response.data
  } catch (error) {
    throw new Error((error as Error).message || 'Something went wrong')
  }
}
