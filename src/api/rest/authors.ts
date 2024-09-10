import axios from 'axios'
import { URL } from '@/constants'
import { handleAxiosError } from '@/helpers'
import { IAuthor } from '@/interfaces'

export const getAuthorById = async (id: number): Promise<IAuthor> => {
  try {
    const { data }: { data: IAuthor } = await axios.get(`${URL.authors}/${id}`)

    return data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get author')
  }
}

export const getAuthorsBySearch = async (
  searchString: string,
): Promise<IAuthor[]> => {
  try {
    const { data }: { data: IAuthor[] } = await axios.get(
      `${URL.authors}?name_like=${searchString}`,
    )

    return data
  } catch (error) {
    throw handleAxiosError(error, 'Author not found')
  }
}
