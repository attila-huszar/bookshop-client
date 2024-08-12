import axios, { AxiosError } from 'axios'
import { URL } from 'constants/index'
import { IAuthor } from 'interfaces'

export const getAuthorById = async (
  id: number,
  rejectWithValue: (value: unknown) => void,
): Promise<IAuthor> => {
  try {
    const { data } = await axios.get(`${URL.authors}/${id}`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getAuthorsBySearch = async (
  searchString: string,
  rejectWithValue: (value: unknown) => void,
): Promise<IAuthor[]> => {
  try {
    const { data } = await axios.get(`${URL.authors}?name_like=${searchString}`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}
