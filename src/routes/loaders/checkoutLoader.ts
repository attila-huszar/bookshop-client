import { redirect } from 'react-router'
import { ROUTE } from '@/routes'
import { paymentRetrieve, store } from '@/store'
import { getPaymentId, sessionStorageAdapter } from '@/helpers'
import { paymentSessionKey } from '@/constants'
import { authLoader } from './authLoader'

export const checkoutLoader = async () => {
  await authLoader()

  const paymentSession = sessionStorageAdapter.get<string>(paymentSessionKey)
  if (!paymentSession) {
    return redirect(ROUTE.HOME)
  }

  const state = store.getState()
  const currentPayment = state.payment?.payment
  if (currentPayment?.session) return null

  try {
    const paymentId = getPaymentId(paymentSession)
    await store.dispatch(paymentRetrieve(paymentId)).unwrap()
    return null
  } catch {
    sessionStorageAdapter.remove(paymentSessionKey)
    return redirect(ROUTE.HOME)
  }
}
