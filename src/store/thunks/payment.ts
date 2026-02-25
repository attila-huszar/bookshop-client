import { createAsyncThunk } from '@reduxjs/toolkit'
import { HTTPError, TimeoutError } from 'ky'
import {
  deletePaymentIntent,
  getOrderSyncStatus,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api'
import { log } from '@/services'
import { defaultCurrency } from '@/constants'
import { OrderSyncStatusError } from '@/errors'
import {
  OrderSyncIssueCode,
  orderSyncPendingCode,
  OrderSyncResponse,
  OrderSyncStatusResponse,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'

const MAX_ORDER_SYNC_RETRIES = 7
const ORDER_SYNC_RETRY_BASE_DELAY_MS = 1000
const ORDER_SYNC_RETRY_MAX_DELAY_MS = 8000
const successStatuses: PaymentIntentStatus[] = ['succeeded', 'requires_capture']
const retryableOrderSyncHttpStatuses = new Set([
  408, 425, 429, 500, 502, 503, 504,
])
const timeoutOrderSyncHttpStatuses = new Set([408, 504])
const retryableOrderSyncPaymentStatuses: PaymentIntentStatus[] = [
  'processing',
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
]

const wait = async (ms: number): Promise<void> =>
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const getOrderSyncRetryDelay = (attempt: number): number => {
  const exponentialDelay =
    ORDER_SYNC_RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1)
  return Math.min(exponentialDelay, ORDER_SYNC_RETRY_MAX_DELAY_MS)
}

const getOrderSyncIssueCodeFromStatus = (
  status: number,
): OrderSyncIssueCode => {
  if (status === 401 || status === 403) return 'unauthorized'
  if (timeoutOrderSyncHttpStatuses.has(status)) return 'timeout'
  if (retryableOrderSyncHttpStatuses.has(status)) return 'retryable'
  return 'unknown'
}
const hasStringError = (v: unknown): v is { error: string } =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { error?: unknown }).error === 'string'

const getOrderSyncApiErrorMessage = (payload: unknown): string | null =>
  hasStringError(payload) ? payload.error : null

const parseOrderSyncError = async (
  error: unknown,
): Promise<{
  message: string
  code: OrderSyncIssueCode
  retryable: boolean
}> => {
  if (error instanceof TimeoutError) {
    return {
      message: 'Order sync request timed out',
      code: 'timeout',
      retryable: true,
    }
  }

  if (error instanceof TypeError) {
    return {
      message: error.message || 'Network error while syncing order status',
      code: 'retryable',
      retryable: true,
    }
  }

  if (error instanceof HTTPError) {
    const { response, message: fallbackMessage } = error
    const { status } = response

    const apiMessage = await response
      .json<unknown>()
      .then(getOrderSyncApiErrorMessage)
      .catch(() => null)

    return {
      message: apiMessage ?? fallbackMessage,
      code: getOrderSyncIssueCodeFromStatus(status),
      retryable: retryableOrderSyncHttpStatuses.has(status),
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    code: 'unknown',
    retryable: false,
  }
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
  { paymentId: string }
>(
  'payment/orderSyncAfterWebhook',
  async ({ paymentId }): Promise<OrderSyncResponse> => {
    if (!paymentId) {
      throw new OrderSyncStatusError(
        'unknown',
        'Missing payment ID for order sync',
      )
    }

    let lastStatus: PaymentIntentStatus | null = null
    let lastRetryError: string | null = null

    for (let attempt = 1; attempt <= MAX_ORDER_SYNC_RETRIES; attempt++) {
      let orderSyncStatus: OrderSyncStatusResponse

      try {
        orderSyncStatus = await getOrderSyncStatus(paymentId)
      } catch (error) {
        const parsedError = await parseOrderSyncError(error)

        if (parsedError.retryable) {
          lastRetryError = parsedError.message

          if (attempt < MAX_ORDER_SYNC_RETRIES) {
            await wait(getOrderSyncRetryDelay(attempt))
            continue
          }

          break
        }

        throw new OrderSyncStatusError(
          parsedError.code,
          `Unable to sync order status: ${parsedError.message}`,
        )
      }

      const status = orderSyncStatus.paymentStatus
      lastStatus = status
      lastRetryError = null

      const shouldRetryByContract =
        'code' in orderSyncStatus &&
        orderSyncStatus.code === orderSyncPendingCode
      const shouldRetryByFallbackStatus =
        retryableOrderSyncPaymentStatuses.includes(status)
      const shouldRetry = shouldRetryByContract || shouldRetryByFallbackStatus

      if (shouldRetry && attempt < MAX_ORDER_SYNC_RETRIES) {
        await wait(getOrderSyncRetryDelay(attempt))
        continue
      }

      if (shouldRetry) {
        break
      }

      if (successStatuses.includes(status)) {
        return {
          paymentId: orderSyncStatus.paymentId ?? paymentId,
          paymentStatus: status,
          amount: orderSyncStatus.amount,
          currency: orderSyncStatus.currency?.toUpperCase() ?? defaultCurrency,
          receiptEmail: orderSyncStatus.receiptEmail,
          shipping: orderSyncStatus.shipping,
          finalizedAt: orderSyncStatus.finalizedAt,
          webhookUpdatedAt: orderSyncStatus.webhookUpdatedAt,
        }
      }

      if (status === 'canceled') {
        return {
          paymentId: orderSyncStatus.paymentId ?? paymentId,
          paymentStatus: status,
          amount: orderSyncStatus.amount,
          currency: orderSyncStatus.currency?.toUpperCase() ?? defaultCurrency,
          receiptEmail: orderSyncStatus.receiptEmail,
          shipping: orderSyncStatus.shipping,
          finalizedAt: orderSyncStatus.finalizedAt,
          webhookUpdatedAt: orderSyncStatus.webhookUpdatedAt,
        }
      }

      return {
        paymentId: orderSyncStatus.paymentId ?? paymentId,
        paymentStatus: status,
        amount: orderSyncStatus.amount,
        currency: orderSyncStatus.currency?.toUpperCase() ?? defaultCurrency,
        receiptEmail: orderSyncStatus.receiptEmail,
        shipping: orderSyncStatus.shipping,
        finalizedAt: orderSyncStatus.finalizedAt,
        webhookUpdatedAt: orderSyncStatus.webhookUpdatedAt,
      }
    }

    const timeoutSuffix = lastStatus
      ? ` (last status: ${lastStatus}${lastRetryError ? `, last retry error: ${lastRetryError}` : ''})`
      : lastRetryError
        ? ` (last retry error: ${lastRetryError})`
        : ''

    throw new OrderSyncStatusError(
      'timeout',
      `Order sync timed out${timeoutSuffix}. Please refresh and verify your order.`,
    )
  },
)
