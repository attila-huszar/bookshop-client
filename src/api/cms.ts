import {
  Author,
  AuthorFormValues,
  BookFormValues,
  BookWithAuthorId,
  Order,
  OrderUpdate,
  UserWithMetadata,
} from '@/types'
import { authRequest, PATH } from './'

export const getBooksCMS = async (): Promise<BookWithAuthorId[]> => {
  const response = await authRequest.get(PATH.cms.books)

  if (!response.ok) {
    throw new Error('Failed to fetch books')
  }
  return await response.json()
}

export const getAuthorsCMS = async (): Promise<Author[]> => {
  const response = await authRequest.get(PATH.cms.authors)

  if (!response.ok) {
    throw new Error('Failed to fetch authors')
  }
  return await response.json()
}

export const getOrdersCMS = async (): Promise<Order[]> => {
  const response = await authRequest.get(PATH.cms.orders)

  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  return await response.json()
}

export const getUsersCMS = async (): Promise<UserWithMetadata[]> => {
  const response = await authRequest.get(PATH.cms.users)

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return await response.json()
}

export const postBookCMS = async (
  book: BookFormValues,
): Promise<BookWithAuthorId> => {
  const response = await authRequest.post(PATH.cms.books, { json: book })

  if (!response.ok) {
    throw new Error('Failed to add book')
  }
  return await response.json()
}

export const postAuthorCMS = async (
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

export const postOrderCMS = async (
  order: Omit<Order, 'id'>,
): Promise<Order> => {
  const response = await authRequest.post(PATH.cms.orders, {
    json: order,
  })

  if (!response.ok) {
    throw new Error('Failed to add order')
  }
  return await response.json()
}

export const postUserCMS = async (
  user: Omit<UserWithMetadata, 'id'>,
): Promise<UserWithMetadata> => {
  const response = await authRequest.post(PATH.cms.users, {
    json: user,
  })

  if (!response.ok) {
    throw new Error('Failed to add user')
  }
  return await response.json()
}

export const patchBookCMS = async (
  bookId: number,
  book: Partial<BookFormValues>,
): Promise<BookWithAuthorId> => {
  const response = await authRequest.patch(PATH.cms.books, {
    json: { id: bookId, ...book },
  })

  if (!response.ok) {
    throw new Error('Failed to update book')
  }
  return await response.json()
}

export const patchAuthorCMS = async (
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

export const patchOrderCMS = async (
  paymentId: string,
  fields: OrderUpdate,
): Promise<Order> => {
  const response = await authRequest.patch(PATH.cms.orders, {
    json: { paymentId, ...fields },
  })

  if (!response.ok) {
    throw new Error('Failed to update order')
  }
  return await response.json()
}

export const patchUserCMS = async (
  userId: number,
  user: Partial<UserWithMetadata>,
): Promise<UserWithMetadata> => {
  const response = await authRequest.patch(PATH.cms.users, {
    json: { id: userId, ...user },
  })

  if (!response.ok) {
    throw new Error('Failed to update user')
  }
  return await response.json()
}

export const deleteBooksCMS = async (
  bookIds: number[],
): Promise<BookWithAuthorId['id'][]> => {
  const response = await authRequest.delete(PATH.cms.books, {
    json: { bookIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete books')
  }
  return await response.json()
}

export const deleteAuthorsCMS = async (
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

export const deleteOrdersCMS = async (
  orderIds: number[],
): Promise<Order['id'][]> => {
  const response = await authRequest.delete(PATH.cms.orders, {
    json: { orderIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete orders')
  }
  return await response.json()
}

export const deleteUsersCMS = async (
  userIds: number[],
): Promise<UserWithMetadata['id'][]> => {
  const response = await authRequest.delete(PATH.cms.users, {
    json: { userIds },
  })

  if (!response.ok) {
    throw new Error('Failed to delete users')
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

  if (!response.ok) {
    throw new Error('Failed to upload product image')
  }
  return await response.json()
}
