import { configureStore } from '@reduxjs/toolkit'
import { booksReducer } from './slices/books'
import { authorsReducer } from './slices/authors'
import { newsReducer } from './slices/news'
import { userReducer } from './slices/user'
import { cartReducer } from './slices/cart'
import { orderReducer } from './slices/order'
import { cartToLocalStorage, paymentIdToLocalStorage } from './middlewares'

export const store = configureStore({
  reducer: {
    books: booksReducer,
    authors: authorsReducer,
    news: newsReducer,
    user: userReducer,
    cart: cartReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = [
      cartToLocalStorage.middleware,
      paymentIdToLocalStorage.middleware,
    ]

    return getDefaultMiddleware().concat(middlewares)
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
