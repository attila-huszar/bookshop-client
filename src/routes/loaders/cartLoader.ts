import { store, fetchCartItems, orderRetrieve } from '@/store'
import type { CartLocalStorage } from '@/types'

export const cartLoader = () => {
  const cart = localStorage.getItem('cart')

  if (cart) {
    const cartArray = JSON.parse(cart) as CartLocalStorage[]
    void store.dispatch(fetchCartItems(cartArray))
  }

  const paymentId = localStorage.getItem('paymentId')

  if (paymentId) {
    void store.dispatch(orderRetrieve(paymentId))
  }
}
