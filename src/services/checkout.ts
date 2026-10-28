import type { Dispatch } from '@reduxjs/toolkit'
import { booksApi } from '@/store/api/booksApi'
import { type PaymentDetails, paymentsApi } from '@/store/api/paymentsApi'
import {
  checkoutAborted,
  checkoutFailed,
  checkoutReady,
  checkoutReset,
  checkoutStarted,
} from '@/store/slices/payment'
import type { AppDispatch, RootState } from '@/store/store'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import {
  clearClientIdempotencyKey,
  getClientIdempotencyKey,
  resetClientIdempotencyKey,
} from '@/helpers/checkout'
import { getApiError, toAppError } from '@/helpers/errors'
import { paymentSessionSchema } from '@/validation/paymentSchemas'
import { paymentIdKey } from '@/constants/keys'
import type { PaymentIntentRequest, PaymentSession } from '@/types'
import { HttpErrorCode, PaymentErrorCode } from '@/types/ApiError'

type CheckoutCommand =
  | { type: 'creating'; payment: PaymentIntentRequest }
  | {
      type: 'restoring'
      paymentId: string
      signal?: AbortSignal
      reuseExisting?: boolean
    }
  | { type: 'canceling'; paymentId: string }

export type CheckoutResult =
  | {
      type: 'ready'
      payment: PaymentSession
      status?: PaymentDetails['status']
    }
  | { type: 'existing'; paymentId: string }
  | { type: 'cleared' }
  | { type: 'stale' }

export const getCheckoutPaymentId = () =>
  sessionStorageAdapter.get<string>(paymentIdKey)

/** The only writer of checkout IDs and accepted workflow transitions. */
export const resetCheckout = () => (dispatch: Dispatch) => {
  sessionStorageAdapter.remove(paymentIdKey)
  resetClientIdempotencyKey()
  dispatch(checkoutReset())
}

/** Adopt a Stripe return before navigation strips its query parameters. */
export const recoverCheckout =
  (stripePaymentId: string | null) => (dispatch: AppDispatch) => {
    const stored = getCheckoutPaymentId()

    if (stripePaymentId && stripePaymentId !== stored) {
      dispatch(resetCheckout())
      sessionStorageAdapter.set(paymentIdKey, stripePaymentId)

      return stripePaymentId
    }

    return stored
  }

/** Refresh canonical book queries; prices never replace basket intent. */
export const refreshCartPrices =
  () =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    await Promise.allSettled(
      getState().cart.cartItems.map(async (item) => {
        const running = dispatch(
          booksApi.util.getRunningQueryThunk('book', item.id),
        )

        if (running) {
          await running
        }

        await dispatch(
          booksApi.endpoints.book.initiate(item.id, {
            subscribe: false,
            forceRefetch: true,
          }),
        ).unwrap()
      }),
    )
  }

async function requestCheckout(
  command: CheckoutCommand,
  dispatch: AppDispatch,
  clientIdempotencyKey?: string,
): Promise<CheckoutResult> {
  switch (command.type) {
    case 'creating': {
      if (!clientIdempotencyKey) {
        throw new TypeError('Missing checkout retry key')
      }

      const request = dispatch(
        paymentsApi.endpoints.createPayment.initiate({
          payment: command.payment,
          clientIdempotencyKey,
        }),
      )

      try {
        return { type: 'ready', payment: await request.unwrap() }
      } finally {
        request.reset()
      }
    }

    case 'restoring': {
      // An aborted navigation must not cancel another caller's shared request.
      const running = dispatch(
        paymentsApi.util.getRunningQueryThunk('payment', command.paymentId),
      )

      if (running) {
        await running
      }

      command.signal?.throwIfAborted()
      const request = dispatch(
        paymentsApi.endpoints.payment.initiate(command.paymentId, {
          subscribe: false,
          forceRefetch: true,
        }),
      )
      const abort = () => request.abort()
      command.signal?.addEventListener('abort', abort, { once: true })

      if (command.signal?.aborted) {
        request.abort()
      }

      try {
        const payment = await request.unwrap()

        return payment.status === 'canceled'
          ? { type: 'cleared' }
          : { type: 'ready', payment, status: payment.status }
      } finally {
        command.signal?.removeEventListener('abort', abort)
      }
    }

    case 'canceling': {
      const request = dispatch(
        paymentsApi.endpoints.cancelPayment.initiate(command.paymentId),
      )

      try {
        await request.unwrap()

        return { type: 'cleared' }
      } finally {
        request.reset()
      }
    }
  }
}

const runCheckout =
  (command: CheckoutCommand) =>
  async (
    dispatch: AppDispatch,
    getState: () => RootState,
  ): Promise<CheckoutResult> => {
    const signal = command.type === 'restoring' ? command.signal : undefined
    signal?.throwIfAborted()
    const storedPaymentId = getCheckoutPaymentId()

    if (command.type !== 'creating' && storedPaymentId !== command.paymentId) {
      return { type: 'stale' }
    }

    const currentPayment = getState().payment.payment

    if (
      command.type === 'restoring' &&
      command.reuseExisting &&
      currentPayment?.paymentId === command.paymentId &&
      currentPayment.paymentToken
    ) {
      return { type: 'ready', payment: currentPayment }
    }

    const operationId = crypto.randomUUID()
    const clientIdempotencyKey =
      command.type === 'creating'
        ? getClientIdempotencyKey(command.payment)
        : undefined
    dispatch(checkoutStarted({ operationId, phase: command.type }))

    let expectedPaymentId = storedPaymentId
    const isCurrent = () =>
      getState().payment.operationId === operationId &&
      getCheckoutPaymentId() === expectedPaymentId

    try {
      const result = await requestCheckout(
        command,
        dispatch,
        clientIdempotencyKey,
      )
      signal?.throwIfAborted()

      if (!isCurrent()) {
        return { type: 'stale' }
      }

      if (result.type === 'cleared') {
        dispatch(resetCheckout())
      } else if (result.type === 'ready') {
        const { paymentId, paymentToken, amount } =
          paymentSessionSchema.validateSync(result.payment)

        sessionStorageAdapter.set(paymentIdKey, paymentId)
        expectedPaymentId = paymentId

        if (clientIdempotencyKey) {
          clearClientIdempotencyKey(clientIdempotencyKey)
        }

        dispatch(checkoutReady({ paymentId, paymentToken, amount }))
      }

      return result
    } catch (error) {
      if (signal?.aborted) {
        if (isCurrent()) {
          dispatch(checkoutAborted())
        }

        signal.throwIfAborted()
      }

      if (!isCurrent()) {
        return { type: 'stale' }
      }

      const status =
        error && typeof error === 'object' && 'status' in error
          ? error.status
          : undefined

      if (
        command.type === 'restoring' &&
        typeof status === 'number' &&
        [401, 403, 404, 410].includes(status)
      ) {
        dispatch(resetCheckout())

        return { type: 'cleared' }
      }

      if (clientIdempotencyKey && status === 410) {
        clearClientIdempotencyKey(clientIdempotencyKey)
      }

      const failure = getApiError(error) ?? {
        code: HttpErrorCode.UnknownResponse,
      }

      if (
        command.type === 'creating' &&
        failure.code === PaymentErrorCode.PriceConflict
      ) {
        await dispatch(refreshCartPrices())

        if (!isCurrent()) {
          return { type: 'stale' }
        }
      }

      dispatch(checkoutFailed(failure))

      throw toAppError(failure)
    }
  }

export const startCheckout =
  (payment: PaymentIntentRequest) => (dispatch: AppDispatch) => {
    const paymentId = getCheckoutPaymentId()

    return paymentId
      ? Promise.resolve<CheckoutResult>({ type: 'existing', paymentId })
      : dispatch(runCheckout({ type: 'creating', payment }))
  }

export const restoreCheckout = (
  paymentId: string,
  options: { signal?: AbortSignal; reuseExisting?: boolean } = {},
) => runCheckout({ type: 'restoring', paymentId, ...options })

export const cancelCheckout = (paymentId: string) =>
  runCheckout({ type: 'canceling', paymentId })
