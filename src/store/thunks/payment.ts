import { createAsyncThunk } from '@reduxjs/toolkit'
import { deletePaymentIntent, getPaymentIntent, postPaymentIntent } from '@/api'
import { log } from '@/services'
import { defaultCurrency } from '@/constants'
import {
  OrderSyncResult,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'

const MAX_ORDER_SYNC_RETRIES = 6
const ORDER_SYNC_RETRY_DELAY_MS = 2000
const successStatuses: PaymentIntentStatus[] = ['succeeded', 'requires_capture']

const wait = async (ms: number): Promise<void> =>
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const paymentCreate = createAsyncThunk(
  'payment/paymentCreate',
  async (payment: PaymentIntentRequest): Promise<PaymentSession> => {
    try {
      const { session, amount } = await postPaymentIntent(payment)

      if (!session) {
        throw new Error('Invalid response from server: missing session')
      }

      return { session, amount }
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
      client_secret: session,
      amount,
      status,
    } = await getPaymentIntent(paymentId)

    if (!session) {
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

    return { session, status, amount }
  },
)

export const paymentCancel = createAsyncThunk(
  'payment/paymentCancel',
  async (paymentId: string) => {
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

export const orderSyncAfterWebhook = createAsyncThunk<OrderSyncResult, string>(
  'payment/orderSyncAfterWebhook',
  async (paymentId: string): Promise<OrderSyncResult> => {
    if (!paymentId) {
      throw new Error('Missing payment ID for order sync')
    }

    let lastStatus: PaymentIntentStatus | null = null

    for (let attempt = 1; attempt <= MAX_ORDER_SYNC_RETRIES; attempt++) {
      const paymentIntent = await getPaymentIntent(paymentId)
      const status = paymentIntent.status
      lastStatus = status

      if (successStatuses.includes(status)) {
        return {
          paymentId: paymentIntent.id ?? paymentId,
          paymentStatus: status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency?.toUpperCase() ?? defaultCurrency,
          receiptEmail: paymentIntent.receipt_email ?? null,
          shipping: paymentIntent.shipping ?? null,
          finalizedAt: paymentIntent.created
            ? new Date(paymentIntent.created * 1000).toISOString()
            : null,
        }
      }

      if (status === 'canceled') {
        throw new Error('Payment was canceled before order sync.')
      }

      const shouldRetry =
        status === 'processing' ||
        status === 'requires_confirmation' ||
        status === 'requires_action'

      if (shouldRetry && attempt < MAX_ORDER_SYNC_RETRIES) {
        await wait(ORDER_SYNC_RETRY_DELAY_MS * attempt)
        continue
      }

      throw new Error(
        `Order is not finalized yet (status: ${status}). Please refresh and try again.`,
      )
    }

    throw new Error(
      `Order sync timed out${lastStatus ? ` (last status: ${lastStatus})` : ''}. Please refresh and verify your order.`,
    )
  },
)
