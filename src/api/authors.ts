import { api } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IAuthor } from '@/interfaces'

export const getAuthorById = (id: number): Promise<IAuthor> => {
  try {
    return api.get(`${PATH.authors}/${id}`).json()
  } catch (error) {
    throw handleErrors(error, 'Author not found')
  }
}

export const getAuthorsBySearch = (
  searchString: string,
): Promise<IAuthor[]> => {
  try {
    return api.get(`${PATH.authors}?name=${searchString}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get authors by search')
  }
}
