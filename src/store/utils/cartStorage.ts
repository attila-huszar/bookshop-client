import type { CartItem } from '@/types'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from '../slices/cart'

type CartAction =
  | ReturnType<typeof cartAdd>
  | ReturnType<typeof cartRemove>
  | ReturnType<typeof cartQuantityAdd>
  | ReturnType<typeof cartQuantityRemove>
  | ReturnType<typeof cartQuantitySet>
  | ReturnType<typeof cartClear>

export const getNextCartItems = (
  action: CartAction,
  currentItems: CartItem[],
): CartItem[] | null => {
  switch (action.type) {
    case cartClear.type:
      return null
    case cartAdd.type: {
      const { id } = action.payload
      return [...currentItems, { id, quantity: 1 }]
    }
    case cartRemove.type: {
      const { id } = action.payload
      return currentItems.filter((item) => item.id !== id)
    }
    case cartQuantityAdd.type: {
      const { id } = action.payload
      return currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    }
    case cartQuantityRemove.type: {
      const { id } = action.payload
      return currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      )
    }
    case cartQuantitySet.type: {
      const { cartItem, newQuantity } = action.payload
      return currentItems.map((item) =>
        item.id === cartItem.id ? { ...item, quantity: newQuantity } : item,
      )
    }
    default:
      return currentItems
  }
}
