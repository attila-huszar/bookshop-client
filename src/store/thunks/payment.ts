import { createAsyncThunk } from '@reduxjs/toolkit'
import { HTTPError } from 'ky'
import {
  deletePaymentIntent,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api/payments'
import { log } from '@/services'
import { sessionStorageAdapter } from '@/helpers'
import {
  paymentIdempotencyKey,
  paymentSessionUnavailableCode,
} from '@/constants'
import { handleError } from '@/errors'
import {
  PaymentCreateIssueCode,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'

type StoredPaymentIdempotency = {
  fingerprint: string
  clientIdempotencyKey: string
}

const getClientIdempotencyKey = (payment: PaymentIntentRequest): string => {
  const fingerprint = JSON.stringify(payment)
  const stored = sessionStorageAdapter.get<StoredPaymentIdempotency>(
    paymentIdempotencyKey,
  )

  if (stored?.fingerprint === fingerprint && stored.clientIdempotencyKey) {
    return stored.clientIdempotencyKey
  }

  const clientIdempotencyKey = crypto.randomUUID()
  sessionStorageAdapter.set(paymentIdempotencyKey, {
    fingerprint,
    clientIdempotencyKey,
  })
  return clientIdempotencyKey
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
  const clientIdempotencyKey = getClientIdempotencyKey(payment)

  try {
    const { paymentId, paymentToken, amount } = await postPaymentIntent(
      payment,
      clientIdempotencyKey,
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
    if (error instanceof HTTPError && error.response.status === 410) {
      sessionStorageAdapter.remove(paymentIdempotencyKey)
    }
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

export const paymentRetrieve = createAsyncThunk<
  PaymentSession & { status: PaymentIntentStatus },
  { paymentId: string; allowSucceeded?: boolean },
  {
    rejectValue: { code: typeof paymentSessionUnavailableCode; message: string }
  }
>(
  'payment/paymentRetrieve',
  async ({ paymentId, allowSucceeded = false }, { rejectWithValue }) => {
    let payment
    try {
      payment = await getPaymentIntent(paymentId)
    } catch (error) {
      if (
        error instanceof HTTPError &&
        [401, 403, 404, 410].includes(error.response.status)
      ) {
        return rejectWithValue({
          code: paymentSessionUnavailableCode,
          message:
            'This payment session is no longer accessible. Please start a new checkout.',
        })
      }
      throw error
    }
    const { client_secret: retrievedPaymentToken, amount, status } = payment

    if (status === 'canceled' || (status === 'succeeded' && !allowSucceeded)) {
      return rejectWithValue({
        code: paymentSessionUnavailableCode,
        message: 'This payment session has ended. Please start a new checkout.',
      })
    }

    if (!retrievedPaymentToken) {
      throw new Error(
        'Invalid response from payment service: missing client secret',
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid payment amount in response')
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
