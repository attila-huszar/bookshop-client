import { authRequest, PATH } from './'
import { Book, CMSAuthor, CMSBook, CMSOrder, CMSUser } from '@/types'

export const getAllBooks = async (): Promise<CMSBook[]> => {
  const response = await authRequest.get(PATH.cms.books.all)
  return await response.json()
}

export const getAllAuthors = async (): Promise<CMSAuthor[]> => {
  const response = await authRequest.get(PATH.cms.authors.all)
  return await response.json()
}

export const getAllUsers = async (): Promise<CMSUser[]> => {
  const response = await authRequest.get(PATH.cms.users.all)
  return await response.json()
}

export const getAllOrders = async (): Promise<CMSOrder[]> => {
  const response = await authRequest.get(PATH.cms.orders.all)
  return await response.json()
}

export const postBook = async (book: Omit<Book, 'id'>): Promise<CMSBook> => {
  const response = await authRequest.post(PATH.cms.books.add, {
    json: book,
  })

  if (!response.ok) {
    throw new Error('Failed to add book')
  }

  return await response.json()
}

export const deleteBooks = async (
  bookIds: number[],
): Promise<CMSBook['id'][]> => {
  const response = await authRequest.delete(PATH.cms.books.delete, {
    json: { bookIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete books')
  }

  return await response.json()
}

export const postAuthor = async (
  author: Omit<CMSAuthor, 'id'>,
): Promise<CMSAuthor> => {
  const response = await authRequest.post(PATH.cms.authors.add, {
    json: author,
  })

  if (!response.ok) {
    throw new Error('Failed to add author')
  }

  return await response.json()
}
