import type { Dispatch } from '@reduxjs/toolkit'
import { booksApi } from '@/store/api/booksApi'
import { paymentsApi } from '@/store/api/paymentsApi'
import { cartRestored } from '@/store/slices/cart'
import {
  checkoutAborted,
  checkoutFailed,
  checkoutReady,
  checkoutReset,
  checkoutStarted,
} from '@/store/slices/payment'
import type { AppDispatch, RootState } from '@/store/store'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { areCartItemsEqual, readStoredCart } from '@/helpers/checkout'
import { getApiError, toAppError } from '@/helpers/errors'
import {
  clearClientIdempotencyKey,
  getClientIdempotencyKey,
  isCurrentClientIdempotencyKey,
  resetClientIdempotencyKey,
} from '@/helpers/idempotency'
import { paymentSessionSchema } from '@/validation/paymentSchemas'
import { cartKey, paymentIdKey } from '@/constants/keys'
import type {
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'
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
      status?: PaymentIntentStatus
    }
  | { type: 'existing'; paymentId: string }
  | { type: 'cleared' }
  | { type: 'stale' }

export const getCheckoutPaymentId = () =>
  localStorageAdapter.get<string>(paymentIdKey)

/** Read current shared state, since a queued event can describe an older write. */
export function listenForCheckoutChanges(
  store: { dispatch: AppDispatch; getState: () => RootState },
  hot?: ImportMeta['hot'],
) {
  const synchronize = () => {
    const cartItems = readStoredCart()
    const state = store.getState()

    if (!areCartItemsEqual(state.cart.cartItems, cartItems)) {
      store.dispatch(cartRestored(cartItems))
    }

    if (
      state.payment.payment &&
      state.payment.payment.paymentId !== getCheckoutPaymentId()
    ) {
      // Do not remove the other tab's current ID or rotate its retry key.
      store.dispatch(checkoutReset())
    }
  }

  const onStorage = (event: StorageEvent) => {
    if (
      event.storageArea === localStorage &&
      (event.key === null ||
        event.key === cartKey ||
        event.key === paymentIdKey)
    ) {
      synchronize()
    }
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', synchronize)
  window.addEventListener('pageshow', synchronize)
  document.addEventListener('visibilitychange', synchronize)

  const stop = () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', synchronize)
    window.removeEventListener('pageshow', synchronize)
    document.removeEventListener('visibilitychange', synchronize)
  }

  hot?.dispose(stop)

  return stop
}

/** The only writer of checkout IDs and accepted workflow transitions. */
export const resetCheckout = () => (dispatch: Dispatch) => {
  localStorageAdapter.remove(paymentIdKey)
  resetClientIdempotencyKey()
  dispatch(checkoutReset())
}

/** Adopt a Stripe return before navigation strips its query parameters. */
export const recoverCheckout =
  (stripePaymentId: string | null) => (dispatch: AppDispatch) => {
    const stored = getCheckoutPaymentId()

    if (stripePaymentId && stripePaymentId !== stored) {
      dispatch(resetCheckout())
      localStorageAdapter.set(paymentIdKey, stripePaymentId)

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
    const isCurrent = (resolvedPaymentId?: string) => {
      if (getState().payment.operationId !== operationId) {
        return false
      }

      if (
        command.type === 'creating' &&
        !areCartItemsEqual(command.payment.items, readStoredCart())
      ) {
        return false
      }

      const sharedPaymentId = getCheckoutPaymentId()

      // Another tab may already have accepted this same idempotent response.
      if (resolvedPaymentId && sharedPaymentId === resolvedPaymentId) {
        return true
      }

      return (
        sharedPaymentId === expectedPaymentId &&
        (!clientIdempotencyKey ||
          isCurrentClientIdempotencyKey(clientIdempotencyKey))
      )
    }

    const discardStaleResult = (): CheckoutResult => {
      if (getState().payment.operationId === operationId) {
        dispatch(checkoutReset())
      }

      return { type: 'stale' }
    }

    try {
      const result = await requestCheckout(
        command,
        dispatch,
        clientIdempotencyKey,
      )
      signal?.throwIfAborted()

      if (
        !isCurrent(
          result.type === 'ready' ? result.payment.paymentId : undefined,
        )
      ) {
        return discardStaleResult()
      }

      if (result.type === 'cleared') {
        dispatch(resetCheckout())
      } else if (result.type === 'ready') {
        const { paymentId, paymentToken, amount } =
          paymentSessionSchema.validateSync(result.payment)

        localStorageAdapter.set(paymentIdKey, paymentId)
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
        return discardStaleResult()
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
          return discardStaleResult()
        }
      }

      dispatch(checkoutFailed(failure))

      throw toAppError(failure)
    }
  }

export const startCheckout =
  (payment: PaymentIntentRequest) => async (dispatch: AppDispatch) => {
    // Wrap the promise so the lock releases before the network request finishes.
    // Identical in-flight creates can retry the same server idempotency key.
    const { result } = await navigator.locks.request(
      'bookshop-checkout',
      (): { result: CheckoutResult | Promise<CheckoutResult> } => {
        const paymentId = getCheckoutPaymentId()

        if (paymentId) {
          return { result: { type: 'existing', paymentId } }
        }

        const cartItems = readStoredCart()

        if (!areCartItemsEqual(payment.items, cartItems)) {
          dispatch(cartRestored(cartItems))

          return { result: { type: 'stale' } }
        }

        return {
          result: dispatch(runCheckout({ type: 'creating', payment })),
        }
      },
    )

    return result
  }

export const restoreCheckout = (
  paymentId: string,
  options: { signal?: AbortSignal; reuseExisting?: boolean } = {},
) => runCheckout({ type: 'restoring', paymentId, ...options })

export const cancelCheckout = (paymentId: string) =>
  runCheckout({ type: 'canceling', paymentId })
