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

    let cartToStore: ILocalCart[] = []
    const actionPayload = action.payload as ICart
    const { cartItem, newQuantity } = actionPayload as unknown as {
      cartItem: ICart
      newQuantity: number
    }

    switch (action.type) {
      case cartAdd.type:
        cartToStore = [
          ...cartFromLocalStorage,
          { id: actionPayload.id, quantity: 1 },
        ]
        break
      case cartRemove.type:
        cartToStore = cartFromLocalStorage.filter(
          (item) => item.id !== actionPayload.id,
        )
        break
      case cartQuantityAdd.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === actionPayload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        break
      case cartQuantityRemove.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === actionPayload.id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        break
      case cartQuantitySet.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === cartItem.id ? { ...item, quantity: newQuantity } : item,
        )

        break
      default:
        break
    }

    localStorage.setItem('cart', JSON.stringify(cartToStore))
  },
})
