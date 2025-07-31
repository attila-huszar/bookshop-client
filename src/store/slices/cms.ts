import { createSlice } from '@reduxjs/toolkit'
import type { CMSState } from '@/types'
import {
  addAuthor,
  addBook,
  delBooks,
  fetchAllAuthors,
  fetchAllBooks,
  fetchAllOrders,
  fetchAllUsers,
} from '../thunks/cms'

const initialState: CMSState = {
  users: [],
  usersLoading: false,
  usersError: null,
  books: [],
  booksLoading: false,
  booksError: null,
  authors: [],
  authorsLoading: false,
  authorsError: null,
  news: [],
  newsLoading: false,
  newsError: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
}

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBooks.pending, (state) => {
        state.booksLoading = true
        state.booksError = null
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.books = action.payload
        state.booksLoading = false
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.booksLoading = false
        state.booksError = action.error.message ?? 'Failed to fetch books'
      })

      .addCase(fetchAllAuthors.pending, (state) => {
        state.authorsLoading = true
        state.authorsError = null
      })
      .addCase(fetchAllAuthors.fulfilled, (state, action) => {
        state.authors = action.payload
        state.authorsLoading = false
      })
      .addCase(fetchAllAuthors.rejected, (state, action) => {
        state.authorsLoading = false
        state.authorsError = action.error.message ?? 'Failed to fetch authors'
      })

      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.usersLoading = false
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.usersError = action.error.message ?? 'Failed to fetch users'
      })

      .addCase(fetchAllOrders.pending, (state) => {
        state.ordersLoading = true
        state.ordersError = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload
        state.ordersLoading = false
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.ordersLoading = false
        state.ordersError = action.error.message ?? 'Failed to fetch orders'
      })

      .addCase(addBook.pending, (state) => {
        state.booksLoading = true
        state.booksError = null
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload)
        state.booksLoading = false
      })
      .addCase(addBook.rejected, (state, action) => {
        state.booksLoading = false
        state.booksError = action.error.message ?? 'Failed to add book'
      })

      .addCase(delBooks.pending, (state) => {
        state.booksLoading = true
        state.booksError = null
      })
      .addCase(delBooks.fulfilled, (state, action) => {
        state.books = state.books.filter(
          (book) => !action.payload.includes(book.id),
        )
        state.booksLoading = false
      })
      .addCase(delBooks.rejected, (state, action) => {
        state.booksLoading = false
        state.booksError = action.error.message ?? 'Failed to delete books'
      })

      .addCase(addAuthor.pending, (state) => {
        state.authorsLoading = true
        state.authorsError = null
      })
      .addCase(addAuthor.fulfilled, (state, action) => {
        state.authors.push(action.payload)
        state.authorsLoading = false
      })
      .addCase(addAuthor.rejected, (state, action) => {
        state.authorsLoading = false
        state.authorsError = action.error.message ?? 'Failed to add author'
      })
  },
})

export const cmsReducer = cmsSlice.reducer
