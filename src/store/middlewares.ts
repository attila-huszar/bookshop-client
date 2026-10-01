import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdKey } from '@/constants'
import { MinimalCart } from '@/types'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from './slices/cart'
import { paymentSessionReset } from './slices/payment'
import { AppDispatch, RootState } from './store'
import { paymentCreate } from './thunks/payment'
import { logout } from './thunks/user'

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

cartToLocalStorageTyped({
  matcher: isAnyOf(
    cartAdd,
    cartRemove,
    cartQuantityAdd,
    cartQuantityRemove,
    cartQuantitySet,
  ),
  effect: (_action, listenerApi) => {
    const previousCartItems = listenerApi.getOriginalState().cart.cartItems
    const currentCartItems = listenerApi.getState().cart.cartItems

    if (previousCartItems !== currentCartItems) {
      listenerApi.dispatch(paymentSessionReset())
    }
  },
})

export const paymentToSessionStorage = createListenerMiddleware()

const paymentToSessionStorageTyped =
  paymentToSessionStorage.startListening.withTypes<RootState, AppDispatch>()

paymentToSessionStorageTyped({
  actionCreator: paymentCreate.fulfilled,
  effect: (action) => {
    sessionStorageAdapter.set(paymentIdKey, action.payload.paymentId)
  },
})

paymentToSessionStorageTyped({
  actionCreator: paymentSessionReset,
  effect: () => {
    sessionStorageAdapter.remove(paymentIdKey)
  },
})

paymentToSessionStorageTyped({
  actionCreator: logout.fulfilled,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(paymentSessionReset())
  },
})
