import { redirect } from 'react-router'
import { ROUTE } from '@/routes'
import { fetchCartItems, store } from '@/store'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentSessionKey } from '@/constants'
import type { CartItem } from '@/types'

export const cartLoader = () => {
  const state = store.getState()
  const activeSession = state.payment?.payment?.session
  if (activeSession) {
    return redirect(`/${ROUTE.CHECKOUT}`)
  }

  const paymentSession = sessionStorageAdapter.get<string>(paymentSessionKey)
  if (paymentSession) {
    return redirect(`/${ROUTE.CHECKOUT}`)
  }

  const cart = localStorageAdapter.get<CartItem[]>(cartKey)

  if (cart && Array.isArray(cart)) {
    void store.dispatch(fetchCartItems(cart))
  }
}
