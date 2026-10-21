import {
  cartAdd,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from '@/store/slices/cart'
import type { Book, Cart } from '@/types'
import { useAppDispatch, useAppSelector } from './redux'

export function useCart() {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((state) => state.cart.cartItems)
  const addToCart = (payload: Book) => dispatch(cartAdd(payload))
  const removeFromCart = (payload: Cart) => dispatch(cartRemove(payload))
  const addQuantity = (payload: Cart) => dispatch(cartQuantityAdd(payload))
  const removeQuantity = (payload: Cart) =>
    dispatch(cartQuantityRemove(payload))
  const setQuantity = (payload: { cartItem: Cart; newQuantity: number }) =>
    dispatch(cartQuantitySet(payload))

  return {
    cartItems,
    addToCart,
    removeFromCart,
    addQuantity,
    removeQuantity,
    setQuantity,
  }
}
