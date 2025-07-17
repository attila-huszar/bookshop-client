import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getAllAuthors,
  getAllBooks,
  getAllOrders,
  getAllUsers,
  postBook,
  deleteBooks,
  postAuthor,
} from '@/api'
import { Author, Book, BookFormValues, BookResponse } from '@/types'

export const fetchAllBooks = createAsyncThunk(
  'books/fetchAllBooks',
  async () => {
    return await getAllBooks()
  },
)

export const fetchAllAuthors = createAsyncThunk(
  'authors/fetchAllAuthors',
  async () => {
    return await getAllAuthors()
  },
)

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async () => {
    return await getAllUsers()
  },
)

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async () => {
    return await getAllOrders()
  },
)

export const addBook = createAsyncThunk<BookResponse, BookFormValues>(
  'books/addBook',
  async (book) => postBook(book),
)

export const delBooks = createAsyncThunk<Book['id'][], number[]>(
  'books/deleteBooks',
  async (bookIds) => deleteBooks(bookIds),
)

export const addAuthor = createAsyncThunk(
  'authors/addAuthor',
  async (author: Omit<Author, 'id'>) => postAuthor(author),
)
