import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  deletePaymentIntent,
  getOrderSyncStatus,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api'
import { log } from '@/services'
import { ORDER_SYNC_MAX_RETRIES, retryableStatuses } from '@/constants'
import {
  OrderSyncIssueCode,
  OrderSyncResponse,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'
import { getOrderSyncRetryDelay, parseOrderSyncError } from '../utils'

const createAbortError = () =>
  new DOMException('Order sync request aborted', 'AbortError')

const isAbortError = (error: unknown): boolean =>
  (error instanceof DOMException && error.name === 'AbortError') ||
  (error instanceof Error && error.name === 'AbortError')

const throwIfAborted = (signal: AbortSignal): void => {
  if (signal.aborted) {
    throw createAbortError()
  }
}

const waitForRetryOrAbort = async (
  delayMs: number,
  signal: AbortSignal,
): Promise<void> => {
  throwIfAborted(signal)

  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)

    const onAbort = () => {
      clearTimeout(timeoutId)
      reject(createAbortError())
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export const paymentCreate = createAsyncThunk(
  'payment/paymentCreate',
  async (payment: PaymentIntentRequest): Promise<PaymentSession> => {
    try {
      const { paymentId, paymentToken, amount } =
        await postPaymentIntent(payment)

      if (!paymentToken) {
        throw new Error('Invalid response from server: missing payment token')
      }

      if (!paymentId) {
        throw new Error('Invalid response from server: missing payment ID')
      }

      return { paymentId, paymentToken, amount }
    } catch (error) {
      void log.error('Order creation failed', { error })
      throw error
    }
  },
)

export const paymentRetrieve = createAsyncThunk(
  'payment/paymentRetrieve',
  async ({
    paymentId,
    allowSucceeded = false,
  }: {
    paymentId: string
    allowSucceeded?: boolean
  }) => {
    const {
      client_secret: retrievedPaymentToken,
      amount,
      status,
    } = await getPaymentIntent(paymentId)

    if (!retrievedPaymentToken) {
      throw new Error(
        'Invalid response from payment service: missing client secret',
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid payment amount in response')
    }

    const isCanceled = status === 'canceled'
    const isSucceeded = status === 'succeeded'

    if (isCanceled || (isSucceeded && !allowSucceeded)) {
      throw new Error(
        `Payment session has ${isSucceeded ? 'already been completed' : 'expired'}. Please start a new checkout.`,
      )
    }

    return { paymentId, paymentToken: retrievedPaymentToken, status, amount }
  },
)

export const paymentCancel = createAsyncThunk(
  'payment/paymentCancel',
  async ({ paymentId }: { paymentId: string }) => {
    if (!paymentId) {
      void log.warn('Failed to cancel Stripe payment intent: missing paymentId')
      throw new Error(
        'Unable to cancel checkout right now: missing payment ID.',
      )
    }

    try {
      await deletePaymentIntent(paymentId)
    } catch (stripeError) {
      void log.warn('Failed to cancel Stripe payment intent', {
        error: stripeError,
        paymentId,
      })

      if (stripeError instanceof Error) {
        throw new Error(
          `Unable to cancel checkout right now: ${stripeError.message}`,
        )
      }

      throw new Error('Unable to cancel checkout right now. Please try again.')
    }
  },
)

export const orderSyncAfterWebhook = createAsyncThunk<
  OrderSyncResponse,
  { paymentId: string },
  { rejectValue: { code: OrderSyncIssueCode; message: string } }
>(
  'payment/orderSyncAfterWebhook',
  async ({ paymentId }, { rejectWithValue, signal }) => {
    if (!paymentId) {
      return rejectWithValue({
        code: 'unknown',
        message: 'Missing payment ID for order sync',
      })
    }

    let lastStatus: PaymentIntentStatus | null = null

    for (let attempt = 1; attempt <= ORDER_SYNC_MAX_RETRIES; attempt++) {
      throwIfAborted(signal)

      let orderSyncStatus: OrderSyncResponse
      let orderSyncHttpStatus: number

      try {
        const orderSyncResponse = await getOrderSyncStatus(paymentId, signal)
        orderSyncStatus = orderSyncResponse.data
        orderSyncHttpStatus = orderSyncResponse.status
      } catch (error) {
        if (isAbortError(error) || signal.aborted) {
          throw error
        }

        const parsedError = await parseOrderSyncError(error)
        const canRetryTransientError =
          (parsedError.code === 'retryable' ||
            parsedError.code === 'timeout') &&
          attempt < ORDER_SYNC_MAX_RETRIES

        if (canRetryTransientError) {
          await waitForRetryOrAbort(getOrderSyncRetryDelay(attempt), signal)
          continue
        }

        return rejectWithValue({
          code: parsedError.code,
          message: `Unable to sync order status: ${parsedError.message}`,
        })
      }

      const status = orderSyncStatus.paymentStatus
      lastStatus = status

      const shouldRetry =
        orderSyncHttpStatus === 202 || retryableStatuses.includes(status)

      if (shouldRetry && attempt < ORDER_SYNC_MAX_RETRIES) {
        await waitForRetryOrAbort(getOrderSyncRetryDelay(attempt), signal)
        continue
      }

      if (shouldRetry) {
        break
      }

      return {
        ...orderSyncStatus,
        paymentStatus: status,
      }
    }

    const timeoutSuffix = lastStatus ? ` (last status: ${lastStatus})` : ''

    return rejectWithValue({
      code: 'timeout',
      message: `Order sync timed out${timeoutSuffix}. Please refresh and verify your order.`,
    })
  },
)
