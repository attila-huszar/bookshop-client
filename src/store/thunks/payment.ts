import { createAsyncThunk } from '@reduxjs/toolkit'
import { HTTPError } from 'ky'
import {
  deletePaymentIntent,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api/payments'
import { log } from '@/services'
import { sessionStorageAdapter } from '@/helpers'
import { paymentIdempotencyKey } from '@/constants'
import { handleError } from '@/errors'
import {
  PaymentCreateIssueCode,
  PaymentIntentRequest,
  PaymentSession,
} from '@/types'

type StoredPaymentIdempotency = {
  fingerprint: string
  key: string
}

const getPaymentIdempotencyKey = (payment: PaymentIntentRequest): string => {
  const fingerprint = JSON.stringify(payment)
  const stored = sessionStorageAdapter.get<StoredPaymentIdempotency>(
    paymentIdempotencyKey,
  )

  if (stored?.fingerprint === fingerprint && stored.key) {
    return stored.key
  }

  const key = crypto.randomUUID()
  sessionStorageAdapter.set(paymentIdempotencyKey, { fingerprint, key })
  return key
}

type PaymentCreateRejectValue = {
  code: PaymentCreateIssueCode
  message: string
}

export const paymentCreate = createAsyncThunk<
  PaymentSession,
  PaymentIntentRequest,
  { rejectValue: PaymentCreateRejectValue }
>('payment/paymentCreate', async (payment, { rejectWithValue }) => {
  const idempotencyKey = getPaymentIdempotencyKey(payment)

  try {
    const { paymentId, paymentToken, amount } = await postPaymentIntent(
      payment,
      idempotencyKey,
    )

    if (!paymentToken) {
      throw new Error('Invalid response from server: missing payment token')
    }

    if (!paymentId) {
      throw new Error('Invalid response from server: missing payment ID')
    }

    sessionStorageAdapter.remove(paymentIdempotencyKey)
    return { paymentId, paymentToken, amount }
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 409) {
      const fallbackMessage =
        'Prices have been updated in your cart. Please review before checkout.'
      const formattedError = handleError({
        error,
        message: fallbackMessage,
      })
      const finalMessage = formattedError.message?.trim() || fallbackMessage

      return rejectWithValue({
        code: 'price_conflict',
        message: finalMessage,
      })
    }

    const fallbackMessage = 'Order creation failed'
    const formattedError = handleError({
      error,
      message: fallbackMessage,
    })
    const finalMessage = formattedError.message?.trim() || fallbackMessage
    void log.error(finalMessage, { error })

    return rejectWithValue({
      code: 'unknown',
      message: finalMessage,
    })
  }
})

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
          { cause: stripeError },
        )
      }

      throw new Error(
        'Unable to cancel checkout right now. Please try again.',
        {
          cause: stripeError,
        },
      )
    }
  },
)
