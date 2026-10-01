import { replace } from 'react-router'
import { ROUTE } from '@/routes'
import { paymentRetrieve, paymentSessionReset, store } from '@/store'
import { getErrorCode, sessionStorageAdapter } from '@/helpers'
import { isSuccessPaymentIntentStatus } from '@/helpers/paymentStatus'
import {
  checkoutQueryParams,
  paymentIdKey,
  paymentSessionUnavailableCode,
} from '@/constants'
import { authLoader } from './authLoader'

export const checkoutLoader = async ({ request }: { request: Request }) => {
  const requestURL = new URL(request.url)
  let paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  const stripeReturnPaymentId = requestURL.searchParams.get(
    checkoutQueryParams.paymentIntent,
  )

  if (!paymentId && stripeReturnPaymentId) {
    paymentId = stripeReturnPaymentId
    sessionStorageAdapter.set(paymentIdKey, stripeReturnPaymentId)
  }

  if (!paymentId) {
    return replace(ROUTE.HOME)
  }

  const hasPaymentIntent = requestURL.searchParams.has(
    checkoutQueryParams.paymentIntent,
  )
  const hasPaymentToken = requestURL.searchParams.has(
    checkoutQueryParams.paymentToken,
  )

  if (hasPaymentIntent || hasPaymentToken) {
    requestURL.searchParams.delete(checkoutQueryParams.paymentIntent)
    requestURL.searchParams.delete(checkoutQueryParams.paymentToken)

    const sanitizedSearch = requestURL.searchParams.toString()
    const sanitizedPath = sanitizedSearch
      ? `/${ROUTE.CHECKOUT}?${sanitizedSearch}`
      : `/${ROUTE.CHECKOUT}`

    return replace(sanitizedPath)
  }

  const isStripeReturn = requestURL.searchParams.has(
    checkoutQueryParams.redirectStatus,
  )

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

    if (
      !isStripeReturn &&
      (isSuccessPaymentIntentStatus(retrievedPayment.status) ||
        retrievedPayment.status === 'processing')
    ) {
      requestURL.searchParams.set(
        checkoutQueryParams.redirectStatus,
        retrievedPayment.status,
      )

      return replace(`/${ROUTE.CHECKOUT}?${requestURL.searchParams.toString()}`)
    }

    return null
  } catch (error) {
    if (getErrorCode(error) === paymentSessionUnavailableCode) {
      sessionStorageAdapter.remove(paymentIdKey)
      store.dispatch(paymentSessionReset())
      return replace(ROUTE.HOME)
    }

    return null
  }
}
