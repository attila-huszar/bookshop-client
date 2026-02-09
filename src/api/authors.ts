import { baseRequest, PATH } from '.'
import type { Author } from '@/types'

export const getAuthorById = async (id: number): Promise<Author> => {
  const response = await baseRequest.get<Author>(`${PATH.authors}/${id}`)
  return await response.json()
}

export const getAuthorsBySearch = async (
  searchString: string,
): Promise<Author[]> => {
  const response = await baseRequest.get<Author[]>(
    `${PATH.authors}?name=${searchString}`,
  )
  return await response.json()
}
