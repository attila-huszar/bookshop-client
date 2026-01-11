import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  deleteAuthorsCMS,
  deleteBooksCMS,
  deleteOrdersCMS,
  deleteUsersCMS,
  getAuthorsCMS,
  getBooksCMS,
  getOrdersCMS,
  getUsersCMS,
  patchAuthorCMS,
  patchBookCMS,
  patchOrderCMS,
  patchUserCMS,
  postAuthorCMS,
  postBookCMS,
  postOrderCMS,
  postUserCMS,
} from '@/api'
import type {
  Author,
  AuthorFormValues,
  Book,
  BookFormValues,
  BookWithAuthorId,
  Order,
  OrderUpdate,
  UserWithMetadata,
} from '@/types'

export const listBooks = createAsyncThunk('books/listBooks', async () => {
  return await getBooksCMS()
})

export const listAuthors = createAsyncThunk('authors/listAuthors', async () => {
  return await getAuthorsCMS()
})

export const listOrders = createAsyncThunk('order/listOrders', async () => {
  return await getOrdersCMS()
})

export const listUsers = createAsyncThunk('user/listUsers', async () => {
  return await getUsersCMS()
})

export const addBook = createAsyncThunk<BookWithAuthorId, BookFormValues>(
  'books/addBook',
  async (book) => postBookCMS(book),
)

export const addAuthor = createAsyncThunk<Author, Omit<Author, 'id'>>(
  'authors/addAuthor',
  async (author) => postAuthorCMS(author),
)

export const addOrder = createAsyncThunk<Order, Omit<Order, 'id'>>(
  'orders/addOrder',
  async (order) => await postOrderCMS(order),
)

export const addUser = createAsyncThunk<
  UserWithMetadata,
  Omit<UserWithMetadata, 'id'>
>('users/addUser', async (user) => await postUserCMS(user))

export const updateBook = createAsyncThunk<
  BookWithAuthorId,
  { bookId: number; book: Partial<BookFormValues> }
>('books/updateBook', async ({ bookId, book }) => patchBookCMS(bookId, book))

export const updateAuthor = createAsyncThunk<
  Author,
  { authorId: number; author: Partial<AuthorFormValues> }
>('authors/updateAuthor', async ({ authorId, author }) =>
  patchAuthorCMS(authorId, author),
)

export const updateOrder = createAsyncThunk<
  Order,
  { paymentId: string; order: OrderUpdate }
>('orders/updateOrder', async ({ paymentId, order }) =>
  patchOrderCMS(paymentId, order),
)

export const updateUser = createAsyncThunk<
  UserWithMetadata,
  { userId: number; user: Partial<UserWithMetadata> }
>(
  'users/updateUser',
  async ({ userId, user }) => await patchUserCMS(userId, user),
)

export const deleteBooks = createAsyncThunk<Book['id'][], number[]>(
  'books/deleteBooks',
  async (bookIds) => deleteBooksCMS(bookIds),
)

export const deleteAuthors = createAsyncThunk<Author['id'][], number[]>(
  'authors/deleteAuthors',
  async (authorIds) => deleteAuthorsCMS(authorIds),
)

export const deleteOrders = createAsyncThunk<number[], number[]>(
  'orders/deleteOrders',
  async (orderIds) => deleteOrdersCMS(orderIds),
)

export const deleteUsers = createAsyncThunk<number[], number[]>(
  'users/deleteUsers',
  async (userIds) => deleteUsersCMS(userIds),
)
