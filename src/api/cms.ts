import { authRequest, PATH } from './'
import { Author, BookFormValues, BookInDB, OrderInDB, UserInDB } from '@/types'

export const getAllBooks = async (): Promise<BookInDB[]> => {
  const response = await authRequest.get(PATH.cms.books.list)
  return await response.json()
}

export const getAllAuthors = async (): Promise<Author[]> => {
  const response = await authRequest.get(PATH.cms.authors.list)
  return await response.json()
}

export const getAllUsers = async (): Promise<UserInDB[]> => {
  const response = await authRequest.get(PATH.cms.users.list)
  return await response.json()
}

export const getAllOrders = async (): Promise<OrderInDB[]> => {
  const response = await authRequest.get(PATH.cms.orders.list)
  return await response.json()
}

export const postBook = async (book: BookFormValues): Promise<BookInDB> => {
  const response = await authRequest.post(PATH.cms.books.create, {
    json: book,
  })

  if (!response.ok) {
    throw new Error('Failed to add book')
  }

  return await response.json()
}

export const deleteBooks = async (
  bookIds: number[],
): Promise<BookInDB['id'][]> => {
  const response = await authRequest.delete(PATH.cms.books.delete, {
    json: { bookIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete books')
  }

  return await response.json()
}

export const postAuthor = async (
  author: Omit<Author, 'id'>,
): Promise<Author> => {
  const response = await authRequest.post(PATH.cms.authors.create, {
    json: author,
  })

  if (!response.ok) {
    throw new Error('Failed to add author')
  }

  return await response.json()
}

export const deleteAuthors = async (
  authorIds: number[],
): Promise<Author['id'][]> => {
  const response = await authRequest.delete(PATH.cms.authors.delete, {
    json: { authorIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete authors')
  }

  return await response.json()
}
