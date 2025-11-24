import { createAsyncThunk } from '@reduxjs/toolkit'
import { PaymentIntent } from '@stripe/stripe-js'
import {
  postCreateOrder,
  getPaymentIntent,
  deletePaymentIntent,
  postPaymentIntent,
  updateOrder,
} from '@/api'
import { log } from '@/libs'
import { OrderStatus, PostPaymentIntent, Order } from '@/types'

export const orderCreate = createAsyncThunk(
  'order/orderCreate',
  async (order: {
    orderToStripe: PostPaymentIntent
    orderToServer: Order
  }): Promise<{
    clientSecret: string
    paymentId: string
    amount: number
  }> => {
    let stripePaymentId: string | null = null

    const stripeResponse = await postPaymentIntent(order.orderToStripe)

    if (!stripeResponse?.clientSecret) {
      throw new Error(
        'Invalid response from payment service: missing client secret',
      )
    }

    const clientSecret = stripeResponse.clientSecret
    const paymentIdMatch = /^pi_[^_]+/.exec(clientSecret)

    if (!paymentIdMatch) {
      throw new Error(
        'Invalid client secret format: unable to extract payment ID',
      )
    }

    stripePaymentId = paymentIdMatch[0]

    const orderPayload = {
      ...order.orderToServer,
      paymentId: stripePaymentId,
    }

    try {
      const orderResponse = await postCreateOrder(orderPayload)

      if (!orderResponse?.paymentId) {
        throw new Error('Invalid response from server: missing payment ID')
      }

      return {
        clientSecret,
        paymentId: orderResponse.paymentId,
        amount: order.orderToStripe.amount,
      }
    } catch (serverError) {
      if (stripePaymentId) {
        try {
          await deletePaymentIntent(stripePaymentId)
          void log.warn(
            'Rolled back Stripe payment intent after server order creation failed',
            {
              paymentId: stripePaymentId,
            },
          )
        } catch (rollbackError) {
          void log.error('Failed to rollback Stripe payment intent', {
            paymentId: stripePaymentId,
            rollbackError,
          })
        }
      }

      throw serverError
    }
  },
)

export const orderRetrieve = createAsyncThunk(
  'order/orderRetrieve',
  async (paymentId: string) => {
    if (!paymentId || typeof paymentId !== 'string') {
      throw new Error('Invalid payment ID provided')
    }

    const stripeResponse = await getPaymentIntent(paymentId)

    if (!stripeResponse?.client_secret) {
      throw new Error(
        'Invalid response from payment service: missing client secret',
      )
    }

    if (
      typeof stripeResponse.amount !== 'number' ||
      stripeResponse.amount <= 0
    ) {
      throw new Error('Invalid payment amount in response')
    }

    return {
      clientSecret: stripeResponse.client_secret,
      amount: stripeResponse.amount,
      status: stripeResponse.status || 'unknown',
    }
  },
)

export const orderCancel = createAsyncThunk(
  'order/orderCancel',
  async (paymentId: string) => {
    if (!paymentId || typeof paymentId !== 'string') {
      throw new Error('Invalid payment ID provided')
    }

    let stripeStatus: PaymentIntent.Status = 'canceled'
    try {
      const stripeDelRes = await deletePaymentIntent(paymentId)
      stripeStatus = stripeDelRes?.status || 'canceled'
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

      if (!updateRes?.orderStatus) {
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
