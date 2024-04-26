import { useAppDispatch, useAppSelector } from '.'
import {
  cartSelector,
  cartAdd,
  cartAddFromLocalStorage,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} from '../store'
import { IBook, ICart } from '../interfaces'

export function useCart() {
  const dispatch = useAppDispatch()
  const cart = useAppSelector(cartSelector)
  const addToCart = (payload: IBook) => dispatch(cartAdd(payload))
  const addToCartFromLocalStorage = (payload: ICart[]) =>
    dispatch(cartAddFromLocalStorage(payload))
  const removeFromCart = (payload: ICart) => dispatch(cartRemove(payload))
  const addQuantity = (payload: ICart) => dispatch(cartQuantityAdd(payload))
  const removeQuantity = (payload: ICart) =>
    dispatch(cartQuantityRemove(payload))
  const setQuantity = (payload: { item: ICart; value: number }) =>
    dispatch(cartQuantitySet(payload))

  return {
    cart,
    addToCart,
    addToCartFromLocalStorage,
    removeFromCart,
    addQuantity,
    removeQuantity,
    setQuantity,
  }
}
