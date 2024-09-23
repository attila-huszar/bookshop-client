import axios from 'axios'
import { jsonServerPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IAuthor } from '@/interfaces'

export const getAuthorById = async (id: number): Promise<IAuthor> => {
  try {
    const { data }: { data: IAuthor } = await axios.get(
      `${jsonServerPath}/${PATH.authors}/${id}`,
    )

    return data
  } catch (error) {
    throw handleErrors(error, 'Author not found')
  }
}

export const getAuthorsBySearch = async (
  searchString: string,
): Promise<IAuthor[]> => {
  try {
    const { data }: { data: IAuthor[] } = await axios.get(
      `${jsonServerPath}/${PATH.authors}?name_like=${searchString}`,
    )

    return data
  } catch (error) {
    throw handleErrors(error, 'Author not found')
  }
}
