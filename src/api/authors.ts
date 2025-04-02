import { baseRequest } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import type { Author } from '@/types'

export const getAuthorById = async (id: number): Promise<Author> => {
  try {
    const response = await baseRequest.get<Author>(
      `${PATH.SERVER.authors}/${id}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Author not found',
    })
    throw formattedError
  }
}

export const getAuthorsBySearch = async (
  searchString: string,
): Promise<Author[]> => {
  try {
    const response = await baseRequest.get<Author[]>(
      `${PATH.SERVER.authors}?name=${searchString}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get authors by search',
    })
    throw formattedError
  }
}
