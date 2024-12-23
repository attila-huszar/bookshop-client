import { baseRequest } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import type { Author } from '@/types'

export const getAuthorById = (id: number): Promise<Author> => {
  try {
    return baseRequest.get(`${PATH.SERVER.authors}/${id}`).json()
  } catch (error) {
    throw handleErrors(error, 'Author not found')
  }
}

export const getAuthorsBySearch = (searchString: string): Promise<Author[]> => {
  try {
    return baseRequest.get(`${PATH.SERVER.authors}?name=${searchString}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get authors by search')
  }
}
