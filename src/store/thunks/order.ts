import { createAsyncThunk } from '@reduxjs/toolkit'
import { postOrder, getPaymentIntent, deletePaymentIntent } from '@/api'
import { log } from '@/libs'
import { OrderCreate } from '@/types'

export const orderCreate = createAsyncThunk(
  'order/orderCreate',
  async (
    order: OrderCreate,
  ): Promise<{ clientSecret: string; amount: number }> => {
    try {
      const { clientSecret, amount } = await postOrder(order)

      if (!clientSecret) {
        throw new Error('Invalid response from server: missing clientSecret')
      }

      return { clientSecret, amount }
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
      client_secret: clientSecret,
      amount,
      status,
    } = await getPaymentIntent(paymentId)

    if (!clientSecret) {
      throw new Error(
        'Invalid response from payment service: missing client secret',
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid payment amount in response')
    }

    return { clientSecret, status, amount }
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
