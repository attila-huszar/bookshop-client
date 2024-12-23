import { useAppDispatch, useAppSelector } from './redux'
import {
  cartSelector,
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from '@/store'
import type { Book, Cart } from '@/types'

export function useCart() {
  const dispatch = useAppDispatch()
  const { cartArray } = useAppSelector(cartSelector)
  const addToCart = (payload: Book) => dispatch(cartAdd(payload))
  const removeFromCart = (payload: Cart) => dispatch(cartRemove(payload))
  const addQuantity = (payload: Cart) => dispatch(cartQuantityAdd(payload))
  const removeQuantity = (payload: Cart) =>
    dispatch(cartQuantityRemove(payload))
  const setQuantity = (payload: { cartItem: Cart; newQuantity: number }) =>
    dispatch(cartQuantitySet(payload))

  return {
    cartArray,
    addToCart,
    removeFromCart,
    addQuantity,
    removeQuantity,
    setQuantity,
  }
}
