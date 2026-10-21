import { i18n } from '@/i18n'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { HTTPError } from 'ky'
import {
  deletePaymentIntent,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api/payments'
import { log } from '@/services/logger'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { getApiError, getErrorMessage, toAppError } from '@/helpers/errors'
import { paymentIdempotencyKey } from '@/constants/keys'
import { paymentSessionUnavailableCode } from '@/constants/payments'
import {
  ApiError,
  PaymentCreateIssueCode,
  PaymentIntentRequest,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'
import { PaymentErrorCode } from '@/types/ApiError'

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
  apiError?: ApiError
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
      throw new Error(i18n.t('checkout.invalidResponse'))
    }

    if (!paymentId) {
      throw new Error(i18n.t('checkout.invalidResponse'))
    }

    sessionStorageAdapter.remove(paymentIdempotencyKey)
    return { paymentId, paymentToken, amount }
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 410) {
      sessionStorageAdapter.remove(paymentIdempotencyKey)
    }
    if (getApiError(error)?.code === PaymentErrorCode.PriceConflict) {
      return rejectWithValue({
        code: 'price_conflict',
        message: getErrorMessage(error, i18n.t('checkout.priceChanged')),
        apiError: getApiError(error),
      })
    }

    return rejectWithValue({
      code: 'unknown',
      message: getErrorMessage(error, i18n.t('checkout.createError')),
      apiError: getApiError(error),
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
          message: i18n.t('checkout.sessionUnavailable'),
        })
      }
      throw toAppError(error, i18n.t('checkout.error'))
    }
    const { client_secret: retrievedPaymentToken, amount, status } = payment

    if (status === 'canceled' || (status === 'succeeded' && !allowSucceeded)) {
      return rejectWithValue({
        code: paymentSessionUnavailableCode,
        message: i18n.t('checkout.sessionEnded'),
      })
    }

    if (!retrievedPaymentToken) {
      throw new Error(i18n.t('checkout.invalidResponse'))
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error(i18n.t('checkout.invalidResponse'))
    }

    return { paymentId, paymentToken: retrievedPaymentToken, status, amount }
  },
)

export const paymentCancel = createAsyncThunk(
  'payment/paymentCancel',
  async ({ paymentId }: { paymentId: string }) => {
    if (!paymentId) {
      void log.warn('Failed to cancel Stripe payment intent: missing paymentId')
      throw new Error(i18n.t('checkout.missingPaymentId'))
    }

    try {
      await deletePaymentIntent(paymentId)
    } catch (error) {
      throw toAppError(error, i18n.t('checkout.cancelError'))
    }
  },
)
