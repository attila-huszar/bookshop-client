import { fetchCartItems, orderRetrieve, store } from '@/store'
import { log } from '@/services'
import type { CartItem } from '@/types'

export const cartLoader = () => {
  const cart = localStorage.getItem('cart')
  if (cart) {
    try {
      const parsed = JSON.parse(cart) as CartItem[]
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
