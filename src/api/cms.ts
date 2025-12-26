import { authRequest, PATH } from './'
import {
  Author,
  AuthorFormValues,
  BookFormValues,
  BookInDB,
  OrderInDB,
  UserInDB,
} from '@/types'

export const getAllBooks = async (): Promise<BookInDB[]> => {
  const response = await authRequest.get(PATH.cms.books)
  return await response.json()
}

export const getAllAuthors = async (): Promise<Author[]> => {
  const response = await authRequest.get(PATH.cms.authors)
  return await response.json()
}

export const getAllUsers = async (): Promise<UserInDB[]> => {
  const response = await authRequest.get(PATH.cms.users)
  return await response.json()
}

export const getAllOrders = async (): Promise<OrderInDB[]> => {
  const response = await authRequest.get(PATH.cms.orders)
  return await response.json()
}

export const postBook = async (book: BookFormValues): Promise<BookInDB> => {
  const response = await authRequest.post(PATH.cms.books, { json: book })

  if (!response.ok) {
    throw new Error('Failed to add book')
  }

  return await response.json()
}

export const patchBook = async (
  bookId: number,
  book: Partial<BookFormValues>,
): Promise<BookInDB> => {
  const response = await authRequest.patch(PATH.cms.books, {
    json: { id: bookId, ...book },
  })

  if (!response.ok) {
    throw new Error('Failed to update book')
  }

  return await response.json()
}

export const delOrders = async (
  orderIds: number[],
): Promise<OrderInDB['id'][]> => {
  const response = await authRequest.delete(PATH.cms.orders, {
    json: { orderIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete orders')
  }

  return await response.json()
}

export const delBooks = async (
  bookIds: number[],
): Promise<BookInDB['id'][]> => {
  const response = await authRequest.delete(PATH.cms.books, {
    json: { bookIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete books')
  }

  return await response.json()
}

export const delAuthors = async (
  authorIds: number[],
): Promise<Author['id'][]> => {
  const response = await authRequest.delete(PATH.cms.authors, {
    json: { authorIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete authors')
  }

  return await response.json()
}

export const delUsers = async (
  userIds: number[],
): Promise<UserInDB['id'][]> => {
  const response = await authRequest.delete(PATH.cms.users, {
    json: { userIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete users')
  }

  return await response.json()
}

export const postAuthor = async (
  author: Omit<Author, 'id'>,
): Promise<Author> => {
  const response = await authRequest.post(PATH.cms.authors, {
    json: author,
  })

  if (!response.ok) {
    throw new Error('Failed to add author')
  }

  return await response.json()
}

export const patchAuthor = async (
  authorId: number,
  author: Partial<AuthorFormValues>,
): Promise<Author> => {
  const response = await authRequest.patch(PATH.cms.authors, {
    json: { id: authorId, ...author },
  })

  if (!response.ok) {
    throw new Error('Failed to update author')
  }

  return await response.json()
}

export const uploadProductImage = async (
  formData: FormData,
): Promise<{ url: string }> => {
  const response = await authRequest.post<{ url: string }>(
    PATH.cms.productImage,
    { body: formData },
  )
  return await response.json()
}
