import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  deletePaymentIntent,
  getOrderSyncStatus,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api'
import { log } from '@/services'
import { wait } from '@/helpers'
import {
  defaultCurrency,
  MAX_ORDER_SYNC_RETRIES,
  retryableStatuses,
  successStatuses,
} from '@/constants'
import { OrderSyncStatusError } from '@/errors'
import {
  orderSyncPendingCode,
  OrderSyncResponse,
  OrderSyncStatusResponse,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'
import { getOrderSyncRetryDelay, parseOrderSyncError } from '../utils'

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
      const shouldRetryByFallbackStatus = retryableStatuses.includes(status)
      const shouldRetry = shouldRetryByContract || shouldRetryByFallbackStatus

      if (shouldRetry && attempt < MAX_ORDER_SYNC_RETRIES) {
        await wait(getOrderSyncRetryDelay(attempt))
        continue
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
