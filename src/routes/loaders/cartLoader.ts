import { store, fetchCartItems, orderRetrieve } from '@/store'
import { log } from '@/helpers'
import type { CartLocalStorage } from '@/types'

export const cartLoader = () => {
  const cart = localStorage.getItem('cart')
  if (cart) {
    try {
      const parsed = JSON.parse(cart) as CartLocalStorage[]
      const cartItems = Array.isArray(parsed) ? parsed : []
      void store.dispatch(fetchCartItems(cartItems))
    } catch (error) {
      void log.error('Failed to parse cart from localStorage', { error })
    }
  }

  const paymentId = localStorage.getItem('paymentId')
  if (paymentId) {
    void store.dispatch(orderRetrieve(paymentId))
  }
}
