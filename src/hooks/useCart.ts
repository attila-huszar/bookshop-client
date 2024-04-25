import { useAppDispatch } from '.'
import { IBook } from '../interfaces'
import { cartAdd, cartRemove } from '../store/cartSlice'

export function useCart() {
  const dispatch = useAppDispatch()

  const addToCart = (payload: IBook) => dispatch(cartAdd(payload))
  const removeFromCart = (payload: IBook) => dispatch(cartRemove(payload))

  return { addToCart, removeFromCart }
}
