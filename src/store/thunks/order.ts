import { createAsyncThunk } from '@reduxjs/toolkit'
import { postOrder, getPaymentIntent, deletePaymentIntent } from '@/api'
import { log } from '@/libs'
import { OrderCreate } from '@/types'

export const orderCreate = createAsyncThunk(
  'order/orderCreate',
  async (
    order: OrderCreate,
  ): Promise<{ paymentSession: string; amount: number }> => {
    try {
      const { paymentSession, amount } = await postOrder(order)

      if (!paymentSession) {
        throw new Error('Invalid response from server: missing paymentSession')
      }

      return { paymentSession, amount }
    } catch (error) {
      void log.error('Order creation failed', { error })
      throw error
    }
  },
)

export const orderRetrieve = createAsyncThunk(
  'order/orderRetrieve',
  async (paymentId: string) => {
    const {
      client_secret: paymentSession,
      amount,
      status,
    } = await getPaymentIntent(paymentId)

    if (!paymentSession) {
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

    return { paymentSession, status, amount }
  },
)

export const orderCancel = createAsyncThunk(
  'order/orderCancel',
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
