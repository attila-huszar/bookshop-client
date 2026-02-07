import { createAsyncThunk } from '@reduxjs/toolkit'
import { deletePaymentIntent, getPaymentIntent, postPaymentIntent } from '@/api'
import { log } from '@/services'
import { PaymentIntentRequest, PaymentSession } from '@/types'

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
  async (paymentId: string) => {
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

    const invalidStatuses = ['canceled', 'succeeded']
    if (invalidStatuses.includes(status)) {
      throw new Error(
        `Payment session has ${status === 'succeeded' ? 'already been completed' : 'expired'}. Please start a new checkout.`,
      )
    }

    return { session, status, amount }
  },
)

export const paymentCancel = createAsyncThunk(
  'payment/paymentCancel',
  async (paymentId: string) => {
    try {
      await deletePaymentIntent(paymentId)
    } catch (stripeError) {
      void log.warn(
        'Failed to cancel Stripe payment intent, continuing with order cancellation',
        {
          error: stripeError,
          paymentId,
        },
      )
    }
  },
)
