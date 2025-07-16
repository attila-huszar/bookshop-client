import { createSlice } from '@reduxjs/toolkit'
import type { CMSState } from '@/types'
import {
  addBook,
  delBooks,
  fetchAllAuthors,
  fetchAllBooks,
  fetchAllOrders,
  fetchAllUsers,
} from '../thunks/cms'

const initialState: CMSState = {
  users: [],
  usersIsLoading: false,
  usersError: null,
  books: [],
  booksIsLoading: false,
  booksError: null,
  authors: [],
  authorsIsLoading: false,
  authorsError: null,
  news: [],
  newsIsLoading: false,
  newsError: null,
  orders: [],
  ordersIsLoading: false,
  ordersError: null,
}

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBooks.pending, (state) => {
        state.booksIsLoading = true
        state.booksError = null
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.books = action.payload
        state.booksIsLoading = false
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.booksIsLoading = false
        state.booksError = action.error.message ?? 'Failed to fetch books'
      })

      .addCase(fetchAllAuthors.pending, (state) => {
        state.authorsIsLoading = true
        state.authorsError = null
      })
      .addCase(fetchAllAuthors.fulfilled, (state, action) => {
        state.authors = action.payload
        state.authorsIsLoading = false
      })
      .addCase(fetchAllAuthors.rejected, (state, action) => {
        state.authorsIsLoading = false
        state.authorsError = action.error.message ?? 'Failed to fetch authors'
      })

      .addCase(fetchAllUsers.pending, (state) => {
        state.usersIsLoading = true
        state.usersError = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.usersIsLoading = false
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersIsLoading = false
        state.usersError = action.error.message ?? 'Failed to fetch users'
      })

      .addCase(fetchAllOrders.pending, (state) => {
        state.ordersIsLoading = true
        state.ordersError = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload
        state.ordersIsLoading = false
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.ordersIsLoading = false
        state.ordersError = action.error.message ?? 'Failed to fetch orders'
      })

      .addCase(addBook.pending, (state) => {
        state.booksIsLoading = true
        state.booksError = null
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload)
        state.booksIsLoading = false
      })
      .addCase(addBook.rejected, (state, action) => {
        state.booksIsLoading = false
        state.booksError = action.error.message ?? 'Failed to add book'
      })

      .addCase(delBooks.pending, (state) => {
        state.booksIsLoading = true
        state.booksError = null
      })
      .addCase(delBooks.fulfilled, (state, action) => {
        state.books = state.books.filter(
          (book) => !action.payload.includes(book.id),
        )
        state.booksIsLoading = false
      })
      .addCase(delBooks.rejected, (state, action) => {
        state.booksIsLoading = false
        state.booksError = action.error.message ?? 'Failed to delete books'
      })
  },
})

export const cmsReducer = cmsSlice.reducer
