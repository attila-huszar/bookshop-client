import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentSessionKey } from '@/constants'
import { MinimalCart } from '@/types'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from './slices/cart'
import { paymentClear } from './slices/payment'
import { AppDispatch, RootState } from './store'
import { paymentCreate } from './thunks/payment'

export const cartToLocalStorage = createListenerMiddleware()

const cartToLocalStorageTyped = cartToLocalStorage.startListening.withTypes<
  RootState,
  AppDispatch
>()

cartToLocalStorageTyped({
  matcher: isAnyOf(
    cartAdd,
    cartRemove,
    cartQuantityAdd,
    cartQuantityRemove,
    cartQuantitySet,
    cartClear,
  ),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState()
    const cartItems = state.cart.cartItems

    if (cartItems.length === 0) {
      localStorageAdapter.remove(cartKey)
      return
    }

    const minimalCartItems: MinimalCart[] = cartItems.map(
      ({ title, price, discount, discountPrice, imgUrl, ...rest }) => rest,
    )
    localStorageAdapter.set(cartKey, minimalCartItems)
  },
})

export const paymentToSessionStorage = createListenerMiddleware()

const paymentToSessionStorageTyped =
  paymentToSessionStorage.startListening.withTypes<RootState, AppDispatch>()

paymentToSessionStorageTyped({
  actionCreator: paymentCreate.fulfilled,
  effect: (action) => {
    sessionStorageAdapter.set(paymentSessionKey, action.payload.session)
  },
})

paymentToSessionStorageTyped({
  matcher: isAnyOf(paymentClear),
  effect: () => {
    sessionStorageAdapter.remove(paymentSessionKey)
  },
})
