import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store'
import {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartClear,
} from './slices/cart'
import { orderClear } from './slices/order'
import { orderCreate } from './thunks/order'
import type { Cart, CartLocalStorage } from '@/types'

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
    if (action.payload) {
      const cartFromLocalStorage: CartLocalStorage[] = JSON.parse(
        localStorage.getItem('cart') ?? '[]',
      ) as CartLocalStorage[]

      let cartToLocalStorage: CartLocalStorage[] = []

      const payload = action.payload as Cart
      const { cartItem, newQuantity } = payload as unknown as {
        cartItem: Cart
        newQuantity: number
      }

      switch (action.type) {
        case cartAdd.type:
          cartToLocalStorage = [
            ...cartFromLocalStorage,
            { id: payload.id, quantity: 1 },
          ]
          break
        case cartRemove.type:
          cartToLocalStorage = cartFromLocalStorage.filter(
            (item) => item.id !== payload.id,
          )
          break
        case cartQuantityAdd.type:
          cartToLocalStorage = cartFromLocalStorage.map((item) =>
            item.id === payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
          break
        case cartQuantityRemove.type:
          cartToLocalStorage = cartFromLocalStorage.map((item) =>
            item.id === payload.id
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          break
        case cartQuantitySet.type:
          cartToLocalStorage = cartFromLocalStorage.map((item) =>
            item.id === cartItem.id ? { ...item, quantity: newQuantity } : item,
          )
          break
        default:
          break
      }

      localStorage.setItem('cart', JSON.stringify(cartToLocalStorage))
    } else {
      localStorage.removeItem('cart')
    }
  },
})

export const clientSecretToLocalStorage = createListenerMiddleware()

const clientSecretToLocalStorageTyped =
  clientSecretToLocalStorage.startListening.withTypes<RootState, AppDispatch>()

clientSecretToLocalStorageTyped({
  actionCreator: orderCreate.fulfilled,
  effect: (action) => {
    // codeql-suppress js/clear-text-storage-of-sensitive-information
    localStorage.setItem('clientSecret', action.payload.clientSecret)
  },
})

clientSecretToLocalStorageTyped({
  actionCreator: orderClear,
  effect: () => {
    localStorage.removeItem('clientSecret')
  },
})
