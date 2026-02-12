import { configureStore } from '@reduxjs/toolkit'
import { cartToLocalStorage, clientSecretToLocalStorage } from './middlewares'
import { authorsReducer } from './slices/authors'
import { booksReducer } from './slices/books'
import { cartReducer } from './slices/cart'
import { cmsReducer } from './slices/cms'
import { newsReducer } from './slices/news'
import { paymentReducer } from './slices/payment'
import { userReducer } from './slices/user'

export const store = configureStore({
  reducer: {
    books: booksReducer,
    authors: authorsReducer,
    news: newsReducer,
    user: userReducer,
    cart: cartReducer,
    payment: paymentReducer,
    cms: cmsReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = [
      cartToLocalStorage.middleware,
      clientSecretToLocalStorage.middleware,
    ]

    return getDefaultMiddleware().concat(middlewares)
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
