import { configureStore } from '@reduxjs/toolkit'
import { booksSlice } from './booksSlice'
import { authorsSlice } from './authorsSlice'

export const store = configureStore({
  reducer: {
    books: booksSlice.reducer,
    authors: authorsSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
