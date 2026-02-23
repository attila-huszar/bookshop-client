import { redirect } from 'react-router'
import { ROUTE } from '@/routes'
import { fetchCartItems, store } from '@/store'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdKey } from '@/constants'
import type { MinimalCart } from '@/types'

export const cartLoader = () => {
  const state = store.getState()
  const activeSession = state.payment?.payment?.paymentToken
  if (activeSession) {
    return redirect(`/${ROUTE.CHECKOUT}`)
  }

  const paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  if (paymentId) {
    return redirect(`/${ROUTE.CHECKOUT}`)
  }

  const cart = localStorageAdapter.get<MinimalCart[]>(cartKey)

  if (cart && Array.isArray(cart)) {
    void store.dispatch(fetchCartItems(cart))
  }
}
