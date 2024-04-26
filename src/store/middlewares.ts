import { Action, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store'
import {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from './cartSlice'
import { ICart, ILocalCart } from '../interfaces'

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
  effect: (action: Action) => {
    const cartFromLocalStorage: ILocalCart[] = JSON.parse(
      localStorage.getItem('cart') || '[]',
    )

    const newAction = action.payload
    let cartToStore: ILocalCart[] = []

    switch (action.type) {
      case cartAdd.type:
        cartToStore = [
          ...cartFromLocalStorage,
          { id: newAction.id, quantity: 1 },
        ]
        break
      case cartRemove.type:
        cartToStore = cartFromLocalStorage.filter(
          (item) => item.id !== newAction.id,
        )
        break
      case cartQuantityAdd.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === newAction.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        break
      case cartQuantityRemove.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === newAction.id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        break
      case cartQuantitySet.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === newAction.item.id
            ? { ...item, quantity: newAction.value }
            : item,
        )
        break
      default:
        break
    }

    localStorage.setItem('cart', JSON.stringify(cartToStore))
  },
})
