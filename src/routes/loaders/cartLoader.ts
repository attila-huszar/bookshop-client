import { replace } from 'react-router'
import { ROUTE } from '@/routes'
import { fetchCartItems, store } from '@/store'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdKey } from '@/constants'
import type { MinimalCart } from '@/types'

export const cartLoader = () => {
  const state = store.getState()
  const activeSession = state.payment?.payment?.paymentToken
  if (activeSession) {
    return replace(`/${ROUTE.CHECKOUT}`)
  }

  const paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  if (paymentId) {
    return replace(`/${ROUTE.CHECKOUT}`)
  }

  const cartItems = localStorageAdapter.get<MinimalCart[]>(cartKey)

  if (cartItems && Array.isArray(cartItems)) {
    void store.dispatch(fetchCartItems({ cartItems }))
  }
}
