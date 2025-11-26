import { createAsyncThunk } from '@reduxjs/toolkit'
import { PaymentIntent } from '@stripe/stripe-js'
import {
  postCreateOrderWithPayment,
  getPaymentIntent,
  deletePaymentIntent,
  updateOrder,
} from '@/api'
import { log } from '@/libs'
import { OrderStatus, OrderCreateRequest } from '@/types'

export const orderCreate = createAsyncThunk(
  'order/orderCreate',
  async (
    orderRequest: OrderCreateRequest,
  ): Promise<{ clientSecret: string; amount: number }> => {
    try {
      const { clientSecret, amount } =
        await postCreateOrderWithPayment(orderRequest)

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
    let stripeStatus: PaymentIntent.Status = 'canceled'

    try {
      const stripeDelRes = await deletePaymentIntent(paymentId)
      stripeStatus = stripeDelRes.status
    } catch (stripeError) {
      void log.warn(
        'Failed to cancel Stripe payment intent, continuing with order cancellation',
        {
          error: stripeError,
          paymentId,
        },
      )
    }

    try {
      const updateRes = await updateOrder({
        paymentId,
        fields: {
          paymentIntentStatus: stripeStatus,
          orderStatus: OrderStatus.Canceled,
        },
      })

      if (!updateRes.orderStatus) {
        throw new Error('Invalid response from server: missing order status')
      }

      return {
        orderStatus: updateRes.orderStatus,
      }
    } catch (serverError) {
      if (stripeStatus === 'canceled') {
        void log.warn('Order canceled in Stripe but server update failed', {
          error: serverError,
          paymentId,
        })
        return {
          orderStatus: OrderStatus.Canceled,
        }
      }
      throw serverError
    }
  },
)
