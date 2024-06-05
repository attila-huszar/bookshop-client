import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from 'store'
import {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from './cartSlice'
import { ICart, ILocalCart } from 'interfaces'

export const localStorageMiddleware = createListenerMiddleware()

const localStorageMiddlewareTyped =
  localStorageMiddleware.startListening.withTypes<RootState, AppDispatch>()

localStorageMiddlewareTyped({
  matcher: isAnyOf(
    cartAdd,
    cartRemove,
    cartQuantityAdd,
    cartQuantityRemove,
    cartQuantitySet,
  ),
  effect: (action) => {
    const cartFromLocalStorage: ILocalCart[] = JSON.parse(
      localStorage.getItem('cart') || '[]',
    )

    let cartToLocalStorage: ILocalCart[] = []
    const actionPayload = action.payload as ICart
    const { cartItem, newQuantity } = actionPayload as unknown as {
      cartItem: ICart
      newQuantity: number
    }

    switch (action.type) {
      case cartAdd.type:
        cartToLocalStorage = [
          ...cartFromLocalStorage,
          { id: actionPayload.id, quantity: 1 },
        ]
        break
      case cartRemove.type:
        cartToLocalStorage = cartFromLocalStorage.filter(
          (item) => item.id !== actionPayload.id,
        )
        break
      case cartQuantityAdd.type:
        cartToLocalStorage = cartFromLocalStorage.map((item) =>
          item.id === actionPayload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        break
      case cartQuantityRemove.type:
        cartToLocalStorage = cartFromLocalStorage.map((item) =>
          item.id === actionPayload.id
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
  },
})
