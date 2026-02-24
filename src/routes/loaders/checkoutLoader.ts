import { replace } from 'react-router'
import { ROUTE } from '@/routes'
import { paymentRetrieve, store } from '@/store'
import { sessionStorageAdapter } from '@/helpers'
import { paymentIdKey } from '@/constants'
import { PaymentIntentStatus } from '@/types'
import { authLoader } from './authLoader'

const successStatuses: PaymentIntentStatus[] = ['succeeded', 'requires_capture']

export const checkoutLoader = async ({ request }: { request: Request }) => {
  const paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  if (!paymentId) {
    return replace(ROUTE.HOME)
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
    const sanitizedPath = sanitizedSearch
      ? `/${ROUTE.CHECKOUT}?${sanitizedSearch}`
      : `/${ROUTE.CHECKOUT}`

    if (typeof window !== 'undefined') {
      window.history.replaceState(window.history.state, '', sanitizedPath)
    }

    return replace(sanitizedPath)
  }

  const isStripeReturn = requestURL.searchParams.has('redirect_status')

  await authLoader()

  const state = store.getState()
  const currentPayment = state.payment?.payment
  const shouldRetrievePayment = !currentPayment?.paymentToken || !isStripeReturn
  if (!shouldRetrievePayment) return null

  try {
    const retrievedPayment = await store
      .dispatch(
        paymentRetrieve({
          paymentId,
          allowSucceeded: true,
        }),
      )
      .unwrap()

    if (!isStripeReturn && successStatuses.includes(retrievedPayment.status)) {
      requestURL.searchParams.set('redirect_status', retrievedPayment.status)

      return replace(`/${ROUTE.CHECKOUT}?${requestURL.searchParams.toString()}`)
    }

    return null
  } catch {
    sessionStorageAdapter.remove(paymentIdKey)
    return replace(ROUTE.HOME)
  }
}
