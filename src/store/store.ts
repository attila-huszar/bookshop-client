import { configureStore } from '@reduxjs/toolkit'
import { cartToLocalStorage, paymentToSessionStorage } from './middlewares'
import { authorsReducer } from './slices/authors'
import { booksReducer } from './slices/books'
import { cartReducer } from './slices/cart'
import { cmsReducer } from './slices/cms'
import { newsReducer } from './slices/news'
import { paymentReducer } from './slices/payment'
import { userReducer } from './slices/user'

const reducer = {
  books: booksReducer,
  authors: authorsReducer,
  news: newsReducer,
  user: userReducer,
  cart: cartReducer,
  payment: paymentReducer,
  cms: cmsReducer,
}

const middlewares = [
  cartToLocalStorage.middleware,
  paymentToSessionStorage.middleware,
]

export const createAppStore = () =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(middlewares),
  })

export const store = createAppStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
