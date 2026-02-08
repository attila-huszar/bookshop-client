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
import type { Author, BookWithAuthorId, Order, UserWithMetadata } from '@/types'

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

export const addBook = createAsyncThunk<
  BookWithAuthorId,
  Omit<BookWithAuthorId, 'id'>
>('books/addBook', async (book) => postBookCMS(book))

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

export const updateBook = createAsyncThunk<BookWithAuthorId, BookWithAuthorId>(
  'books/updateBook',
  async (book) => patchBookCMS(book),
)

export const updateAuthor = createAsyncThunk<Author, Author>(
  'authors/updateAuthor',
  async (author) => patchAuthorCMS(author),
)

export const updateOrder = createAsyncThunk<Order, Order>(
  'orders/updateOrder',
  async (order) => patchOrderCMS(order),
)

export const updateUser = createAsyncThunk<UserWithMetadata, UserWithMetadata>(
  'users/updateUser',
  async (user) => await patchUserCMS(user),
)

export const deleteBooks = createAsyncThunk<BookWithAuthorId['id'][], number[]>(
  'books/deleteBooks',
  async (bookIds) => deleteBooksCMS(bookIds),
)

export const deleteAuthors = createAsyncThunk<Author['id'][], number[]>(
  'authors/deleteAuthors',
  async (authorIds) => deleteAuthorsCMS(authorIds),
)

export const deleteOrders = createAsyncThunk<Order['id'][], number[]>(
  'orders/deleteOrders',
  async (orderIds) => deleteOrdersCMS(orderIds),
)

export const deleteUsers = createAsyncThunk<UserWithMetadata['id'][], number[]>(
  'users/deleteUsers',
  async (userIds) => deleteUsersCMS(userIds),
)
