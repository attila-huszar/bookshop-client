import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { configureAuthRequest } from '@/api/authRequest'
import { bookshopApi } from './api/bookshopApi'
import { persistenceMiddleware } from './persistenceMiddleware'
import { booksReducer } from './slices/books'
import { cartReducer } from './slices/cart'
import { paymentReducer } from './slices/payment'
import { userReducer } from './slices/user'
import { expireAuthSession, fetchAuthTokens } from './thunks/user'

const reducer = {
  [bookshopApi.reducerPath]: bookshopApi.reducer,
  books: booksReducer,
  user: userReducer,
  cart: cartReducer,
  payment: paymentReducer,
}

export const createAppStore = () =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        bookshopApi.middleware,
        persistenceMiddleware.middleware,
      ),
  })

export const store = createAppStore()
setupListeners(store.dispatch)
configureAuthRequest({
  getAccessToken: () => store.getState().user.accessToken,
  refresh: () => store.dispatch(fetchAuthTokens()).unwrap(),
  expire: (accessToken) => store.dispatch(expireAuthSession(accessToken)),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
