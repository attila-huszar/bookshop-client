import { redirect } from 'react-router'
import { ROUTE } from '@/routes'
import { paymentRetrieve, store } from '@/store'
import { sessionStorageAdapter } from '@/helpers'
import { paymentIdKey } from '@/constants'
import { authLoader } from './authLoader'

export const checkoutLoader = async ({ request }: { request: Request }) => {
  await authLoader()

  const paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  if (!paymentId) {
    return redirect(ROUTE.HOME)
  }

  const requestURL = new URL(request.url)
  const hasPaymentIntent = requestURL.searchParams.has('payment_intent')
  const hasClientSecret = requestURL.searchParams.has(
    'payment_intent_client_secret',
  )

  if (hasPaymentIntent || hasClientSecret) {
    requestURL.searchParams.delete('payment_intent')
    requestURL.searchParams.delete('payment_intent_client_secret')

    const sanitizedSearch = requestURL.searchParams.toString()
    return redirect(
      sanitizedSearch
        ? `/${ROUTE.CHECKOUT}?${sanitizedSearch}`
        : `/${ROUTE.CHECKOUT}`,
    )
  }

  const isStripeReturn = requestURL.searchParams.has('redirect_status')

  const state = store.getState()
  const currentPayment = state.payment?.payment
  if (currentPayment?.paymentToken) return null

  try {
    await store
      .dispatch(paymentRetrieve({ paymentId, allowSucceeded: isStripeReturn }))
      .unwrap()
    return null
  } catch {
    sessionStorageAdapter.remove(paymentIdKey)
    return redirect(ROUTE.HOME)
  }
}
