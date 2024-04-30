import { useAppDispatch, useAppSelector } from '.'
import {
  cartDataSelector,
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from '../store'
import { IBook, ICart } from '../interfaces'

export function useCart() {
  const dispatch = useAppDispatch()
  const cart = useAppSelector(cartDataSelector)
  const addToCart = (payload: IBook) => dispatch(cartAdd(payload))
  const removeFromCart = (payload: ICart) => dispatch(cartRemove(payload))
  const addQuantity = (payload: ICart) => dispatch(cartQuantityAdd(payload))
  const removeQuantity = (payload: ICart) =>
    dispatch(cartQuantityRemove(payload))
  const setQuantity = (payload: { item: ICart; value: number }) =>
    dispatch(cartQuantitySet(payload))

  return {
    cart,
    addToCart,
    removeFromCart,
    addQuantity,
    removeQuantity,
    setQuantity,
  }
}
