import { createAsyncThunk } from '@reduxjs/toolkit'
import { getAllAuthors, getAllBooks, getAllOrders, getAllUsers } from '@/api'

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
