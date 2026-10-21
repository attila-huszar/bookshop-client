import { replace } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'
import { ROUTE } from '@/routes/route'
import { paymentSessionReset } from '@/store/slices/payment'
import { store } from '@/store/store'
import { paymentRetrieve } from '@/store/thunks/payment'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { isSuccessPaymentIntentStatus } from '@/helpers/checkout'
import { getErrorCode } from '@/helpers/errors'
import { paymentIdKey } from '@/constants/keys'
import {
  checkoutQueryParams,
  paymentSessionUnavailableCode,
} from '@/constants/payments'
import { authLoader } from './authLoader'

export const checkoutLoader = async ({
  request,
}: Pick<LoaderFunctionArgs, 'request'>) => {
  request.signal.throwIfAborted()

  const requestURL = new URL(request.url)
  let paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  const stripeReturnPaymentId = requestURL.searchParams.get(
    checkoutQueryParams.paymentIntent,
  )

  if (stripeReturnPaymentId && stripeReturnPaymentId !== paymentId) {
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
  request.signal.throwIfAborted()

  const state = store.getState()
  const currentPayment = state.payment?.payment
  const hasMatchingPayment =
    currentPayment?.paymentId === paymentId &&
    Boolean(currentPayment.paymentToken)
  const shouldRetrievePayment = !hasMatchingPayment || !isStripeReturn

  if (!shouldRetrievePayment) {
    return null
  }

  try {
    const retrievedPayment = await store
      .dispatch(
        paymentRetrieve({
          paymentId,
          allowSucceeded: true,
        }),
      )
      .unwrap()

    request.signal.throwIfAborted()

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
    request.signal.throwIfAborted()

    if (getErrorCode(error) === paymentSessionUnavailableCode) {
      sessionStorageAdapter.remove(paymentIdKey)
      store.dispatch(paymentSessionReset())

      return replace(ROUTE.HOME)
    }

    return null
  }
}
