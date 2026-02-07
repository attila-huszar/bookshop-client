import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentSessionKey } from '@/constants'
import type { CartItem } from '@/types'
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
import { getNextCartItems } from './utils/cartStorage'

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
  effect: (action) => {
    const typedAction = action as Parameters<typeof getNextCartItems>[0]
    const cartFromLocalStorage: CartItem[] =
      localStorageAdapter.get<CartItem[]>(cartKey) ?? []
    const nextItems = getNextCartItems(typedAction, cartFromLocalStorage)

    if (!nextItems) {
      localStorageAdapter.remove(cartKey)
      return
    }

    localStorageAdapter.set(cartKey, nextItems)
  },
})

export const clientSecretToLocalStorage = createListenerMiddleware()

const clientSecretToLocalStorageTyped =
  clientSecretToLocalStorage.startListening.withTypes<RootState, AppDispatch>()

clientSecretToLocalStorageTyped({
  actionCreator: paymentCreate.fulfilled,
  effect: (action) => {
    sessionStorageAdapter.set(paymentSessionKey, action.payload.session)
  },
})

clientSecretToLocalStorageTyped({
  matcher: isAnyOf(paymentClear),
  effect: () => {
    sessionStorageAdapter.remove(paymentSessionKey)
  },
})
