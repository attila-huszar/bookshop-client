import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store'
import {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartClear,
} from './cartSlice'
import { orderClear, orderCreate } from './orderSlice'
import { ICart, ILocalCart } from '@/interfaces'

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
      const cartFromLocalStorage: ILocalCart[] = JSON.parse(
        localStorage.getItem('cart') ?? '[]',
      ) as ILocalCart[]

      let cartToLocalStorage: ILocalCart[] = []

      const payload = action.payload as ICart
      const { cartItem, newQuantity } = payload as unknown as {
        cartItem: ICart
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

export const paymentIdToLocalStorage = createListenerMiddleware()

const paymentIdToLocalStorageTyped =
  paymentIdToLocalStorage.startListening.withTypes<RootState, AppDispatch>()

paymentIdToLocalStorageTyped({
  actionCreator: orderCreate.fulfilled,
  effect: (action) => {
    localStorage.setItem(
      'paymentId',
      action.payload.clientSecret.split('_secret_')[0],
    )
  },
})

paymentIdToLocalStorageTyped({
  actionCreator: orderClear,
  effect: () => {
    localStorage.removeItem('paymentId')
  },
})
