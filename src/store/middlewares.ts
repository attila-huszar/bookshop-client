import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store'
import {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from './cartSlice'
import { ILocalCart } from '../interfaces'

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

    switch (action.type) {
      case cartAdd.type:
        cartToStore = [
          ...cartFromLocalStorage,
          { id: action.payload.id, quantity: 1 },
        ]
        break
      case cartRemove.type:
        cartToStore = cartFromLocalStorage.filter(
          (item) => item.id !== action.payload.id,
        )
        break
      case cartQuantityAdd.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        break
      case cartQuantityRemove.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        break
      case cartQuantitySet.type:
        cartToStore = cartFromLocalStorage.map((item) =>
          item.id === action.payload.item.id
            ? { ...item, quantity: action.payload.value }
            : item,
        )
        break
      default:
        break
    }

    localStorage.setItem('cart', JSON.stringify(cartToStore))
  },
})
