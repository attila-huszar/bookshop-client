import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { resetCheckout } from '@/services/checkout'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { cartKey } from '@/constants/keys'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from './slices/cart'
import type { AppDispatch, RootState } from './store'

export const persistenceMiddleware = createListenerMiddleware()
const startListening = persistenceMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>()

startListening({
  matcher: isAnyOf(
    cartAdd,
    cartRemove,
    cartQuantityAdd,
    cartQuantityRemove,
    cartQuantitySet,
    cartClear,
  ),
  effect: (_action, api) => {
    const cartItems = api.getState().cart.cartItems

    if (api.getOriginalState().cart.cartItems === cartItems) {
      return
    }

    api.dispatch(resetCheckout())

    if (cartItems.length) {
      localStorageAdapter.set(cartKey, cartItems)
    } else {
      localStorageAdapter.remove(cartKey)
    }
  },
})
