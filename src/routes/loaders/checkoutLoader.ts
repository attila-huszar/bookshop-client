import { redirect } from 'react-router'
import { ROUTE } from '@/routes'
import { paymentRetrieve, store } from '@/store'
import { getPaymentId, sessionStorageAdapter } from '@/helpers'
import { paymentSessionKey } from '@/constants'
import { authLoader } from './authLoader'

export const checkoutLoader = async ({ request }: { request: Request }) => {
  await authLoader()

  const paymentSession = sessionStorageAdapter.get<string>(paymentSessionKey)
  if (!paymentSession) {
    return redirect(ROUTE.HOME)
  }

  const requestURL = new URL(request.url)
  const isStripeReturn =
    requestURL.searchParams.has('payment_intent_client_secret') ||
    requestURL.searchParams.has('redirect_status')

  const state = store.getState()
  const currentPayment = state.payment?.payment
  if (currentPayment?.session) return null

  try {
    const paymentId = getPaymentId(paymentSession)
    await store
      .dispatch(paymentRetrieve({ paymentId, allowSucceeded: isStripeReturn }))
      .unwrap()
    return null
  } catch {
    sessionStorageAdapter.remove(paymentSessionKey)
    return redirect(ROUTE.HOME)
  }
}
