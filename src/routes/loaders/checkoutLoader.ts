import { type LoaderFunctionArgs, replace } from 'react-router'
import { ROUTE } from '@/routes/route'
import { store } from '@/store/store'
import { recoverCheckout, restoreCheckout } from '@/services/checkout'
import { bootstrapSession } from '@/services/session'
import {
  checkoutQueryParams,
  isSuccessPaymentIntentStatus,
} from '@/helpers/checkout'

export const checkoutLoader = async ({
  request,
}: Pick<LoaderFunctionArgs, 'request'>) => {
  const { signal } = request
  signal.throwIfAborted()

  const url = new URL(request.url)
  const params = url.searchParams
  const paymentId = store.dispatch(
    recoverCheckout(params.get(checkoutQueryParams.paymentIntent)),
  )

  if (!paymentId) {
    return replace(ROUTE.HOME)
  }

  // Strip Stripe return fields before authentication or payment requests.
  if (
    params.has(checkoutQueryParams.paymentIntent) ||
    params.has(checkoutQueryParams.paymentToken)
  ) {
    params.delete(checkoutQueryParams.paymentIntent)
    params.delete(checkoutQueryParams.paymentToken)

    return replace(`/${ROUTE.CHECKOUT}${url.search}`)
  }

  const isStripeReturn = params.has(checkoutQueryParams.redirectStatus)
  await bootstrapSession()
  signal.throwIfAborted()

  try {
    const result = await store.dispatch(
      restoreCheckout(paymentId, {
        signal,
        reuseExisting: isStripeReturn,
      }),
    )
    signal.throwIfAborted()

    if (result.type === 'cleared') {
      return replace(ROUTE.HOME)
    }

    if (
      result.type === 'ready' &&
      !isStripeReturn &&
      (isSuccessPaymentIntentStatus(result.status) ||
        result.status === 'processing')
    ) {
      params.set(checkoutQueryParams.redirectStatus, result.status)

      return replace(`/${ROUTE.CHECKOUT}${url.search}`)
    }
  } catch {
    signal.throwIfAborted()
    // The coordinator retains transient failures for the checkout retry UI.
  }
}
