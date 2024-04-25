import { configureStore } from '@reduxjs/toolkit'
import { booksReducer } from './booksSlice'
import { authorsReducer } from './authorsSlice'
import { newsReducer } from './newsSlice'
import { userReducer } from './userSlice'
import { cartReducer } from './cartSlice'

export const store = configureStore({
  reducer: {
    books: booksReducer,
    authors: authorsReducer,
    news: newsReducer,
    user: userReducer,
    cart: cartReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
