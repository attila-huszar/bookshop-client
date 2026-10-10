import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdempotencyKey, paymentIdKey } from '@/constants'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from './slices/cart'
import { paymentSessionReset } from './slices/payment'
import type { AppDispatch, RootState } from './store'
import { paymentCancel, paymentCreate } from './thunks/payment'

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
    const previousCart = api.getOriginalState().cart.cartItems
    const cartItems = api.getState().cart.cartItems

    if (previousCart === cartItems) {
      return
    }

    // A changed basket ends the persisted checkout attempt.
    api.dispatch(paymentSessionReset())

    if (cartItems.length === 0) {
      localStorageAdapter.remove(cartKey)

      return
    }

    localStorageAdapter.set(
      cartKey,
      cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
    )
  },
})

startListening({
  actionCreator: paymentCreate.fulfilled,
  effect: (action) => {
    sessionStorageAdapter.set(paymentIdKey, action.payload.paymentId)
  },
})

startListening({
  matcher: isAnyOf(paymentSessionReset, paymentCancel.fulfilled),
  effect: () => {
    sessionStorageAdapter.remove(paymentIdKey)
    sessionStorageAdapter.remove(paymentIdempotencyKey)
  },
})
