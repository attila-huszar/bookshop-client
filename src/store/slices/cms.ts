import { createSlice } from '@reduxjs/toolkit'
import type { CMSState } from '@/types'
import {
  addAuthor,
  addBook,
  deleteAuthors,
  deleteBooks,
  listAuthors,
  listBooks,
  listOrders,
  listUsers,
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
      .addCase(listBooks.pending, (state) => {
        state.booksLoading = true
        state.booksError = null
      })
      .addCase(listBooks.fulfilled, (state, action) => {
        state.books = action.payload
        state.booksLoading = false
      })
      .addCase(listBooks.rejected, (state, action) => {
        state.booksLoading = false
        state.booksError = action.error.message ?? 'Failed to fetch books'
      })

      .addCase(listAuthors.pending, (state) => {
        state.authorsLoading = true
        state.authorsError = null
      })
      .addCase(listAuthors.fulfilled, (state, action) => {
        state.authors = action.payload
        state.authorsLoading = false
      })
      .addCase(listAuthors.rejected, (state, action) => {
        state.authorsLoading = false
        state.authorsError = action.error.message ?? 'Failed to fetch authors'
      })

      .addCase(listUsers.pending, (state) => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.usersLoading = false
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.usersError = action.error.message ?? 'Failed to fetch users'
      })

      .addCase(listOrders.pending, (state) => {
        state.ordersLoading = true
        state.ordersError = null
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.orders = action.payload
        state.ordersLoading = false
      })
      .addCase(listOrders.rejected, (state, action) => {
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

      .addCase(deleteBooks.pending, (state) => {
        state.booksLoading = true
        state.booksError = null
      })
      .addCase(deleteBooks.fulfilled, (state, action) => {
        state.books = state.books.filter(
          (book) => !action.payload.includes(book.id),
        )
        state.booksLoading = false
      })
      .addCase(deleteBooks.rejected, (state, action) => {
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

      .addCase(deleteAuthors.pending, (state) => {
        state.authorsLoading = true
        state.authorsError = null
      })
      .addCase(deleteAuthors.fulfilled, (state, action) => {
        state.authors = state.authors.filter(
          (author) => !action.payload.includes(author.id),
        )
        state.authorsLoading = false
      })
      .addCase(deleteAuthors.rejected, (state, action) => {
        state.authorsLoading = false
        state.authorsError = action.error.message ?? 'Failed to delete authors'
      })
  },
})

export const cmsReducer = cmsSlice.reducer
