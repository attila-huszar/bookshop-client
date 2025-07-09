import { store, fetchCartItems, orderRetrieve } from '@/store'
import type { CartLocalStorage } from '@/types'

export const cartLoader = () => {
  const cart = localStorage.getItem('cart')
  const state = store.getState()

  if (cart && state.cart.cartArray.length === 0) {
    const cartArray = JSON.parse(cart) as CartLocalStorage[]
    void store.dispatch(fetchCartItems(cartArray))
  }

  const paymentId = localStorage.getItem('paymentId')

  if (paymentId && !state.order.order) {
    void store.dispatch(orderRetrieve(paymentId))
  }
}
