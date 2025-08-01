import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getAllAuthors,
  getAllBooks,
  getAllOrders,
  getAllUsers,
  postBook,
  delBooks,
  postAuthor,
  delAuthors,
} from '@/api'
import { Author, Book, BookFormValues, BookInDB } from '@/types'

export const listBooks = createAsyncThunk('books/listBooks', async () => {
  return await getAllBooks()
})

export const listAuthors = createAsyncThunk('authors/listAuthors', async () => {
  return await getAllAuthors()
})

export const listUsers = createAsyncThunk('user/listUsers', async () => {
  return await getAllUsers()
})

export const listOrders = createAsyncThunk('order/listOrders', async () => {
  return await getAllOrders()
})

export const addBook = createAsyncThunk<BookInDB, BookFormValues>(
  'books/addBook',
  async (book) => postBook(book),
)

export const deleteBooks = createAsyncThunk<Book['id'][], number[]>(
  'books/deleteBooks',
  async (bookIds) => delBooks(bookIds),
)

export const addAuthor = createAsyncThunk(
  'authors/addAuthor',
  async (author: Omit<Author, 'id'>) => postAuthor(author),
)

export const deleteAuthors = createAsyncThunk<Author['id'][], number[]>(
  'authors/deleteAuthors',
  async (authorIds) => delAuthors(authorIds),
)
