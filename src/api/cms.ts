import { authRequest, PATH } from './'
import { CMSAuthor, CMSBook, CMSOrder, CMSUser } from '@/types'

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
