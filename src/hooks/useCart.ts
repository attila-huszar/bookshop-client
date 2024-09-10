import { useAppDispatch, useAppSelector } from './redux'
import {
  cartSelector,
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from '@/store'
import { IBook, ICart } from '@/interfaces'

export function useCart() {
  const dispatch = useAppDispatch()
  const { cartArray } = useAppSelector(cartSelector)
  const addToCart = (payload: IBook) => dispatch(cartAdd(payload))
  const removeFromCart = (payload: ICart) => dispatch(cartRemove(payload))
  const addQuantity = (payload: ICart) => dispatch(cartQuantityAdd(payload))
  const removeQuantity = (payload: ICart) =>
    dispatch(cartQuantityRemove(payload))
  const setQuantity = (payload: { cartItem: ICart; newQuantity: number }) =>
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
