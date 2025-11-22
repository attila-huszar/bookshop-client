import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  postCreateOrder,
  getPaymentIntent,
  deletePaymentIntent,
  postPaymentIntent,
  updateOrder,
} from '@/api'
import { OrderStatus, PostPaymentIntent, Order } from '@/types'
import { log } from '@/libs'

export const orderCreate = createAsyncThunk(
  'order/orderCreate',
  async (
    order: {
      orderToStripe: PostPaymentIntent
      orderToServer: Order
    },
    { rejectWithValue },
  ): Promise<{
    clientSecret: string
    paymentId: string
    amount: number
    currency: string
  }> => {
    let stripePaymentId: string | null = null

    try {
      // Step 1: Create payment intent with Stripe
      const stripeResponse = await postPaymentIntent(order.orderToStripe)

      if (!stripeResponse?.clientSecret) {
        throw new Error('Invalid response from payment service: missing client secret')
      }

      const clientSecret = stripeResponse.clientSecret
      const paymentIdMatch = clientSecret.match(/^pi_[^_]+/)
      
      if (!paymentIdMatch) {
        throw new Error('Invalid client secret format: unable to extract payment ID')
      }

      stripePaymentId = paymentIdMatch[0]
      order.orderToServer.paymentId = stripePaymentId

      // Step 2: Create order on server
      try {
        const orderResponse = await postCreateOrder(order.orderToServer)

        if (!orderResponse?.paymentId) {
          throw new Error('Invalid response from server: missing payment ID')
        }

        return {
          clientSecret,
          paymentId: orderResponse.paymentId,
          amount: order.orderToStripe.amount,
          currency: order.orderToStripe.currency,
        }
      } catch (serverError) {
        // Rollback: Cancel the Stripe payment intent if server order creation fails
        if (stripePaymentId) {
          try {
            await deletePaymentIntent(stripePaymentId)
            void log.warn('Rolled back Stripe payment intent after server order creation failed', {
              paymentId: stripePaymentId,
            })
          } catch (rollbackError) {
            void log.error('Failed to rollback Stripe payment intent', {
              paymentId: stripePaymentId,
              rollbackError,
            })
          }
        }

        throw serverError
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create order. Please try again.'
      
      void log.error('Order creation failed', { error, order })
      return rejectWithValue(errorMessage)
    }
  },
)

export const orderRetrieve = createAsyncThunk(
  'order/orderRetrieve',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      if (!paymentId || typeof paymentId !== 'string') {
        throw new Error('Invalid payment ID provided')
      }

      const stripeResponse = await getPaymentIntent(paymentId)

      if (!stripeResponse?.client_secret) {
        throw new Error('Invalid response from payment service: missing client secret')
      }

      if (typeof stripeResponse.amount !== 'number' || stripeResponse.amount <= 0) {
        throw new Error('Invalid payment amount in response')
      }

      if (!stripeResponse.currency) {
        throw new Error('Invalid currency in response')
      }

      return {
        clientSecret: stripeResponse.client_secret,
        amount: stripeResponse.amount,
        currency: stripeResponse.currency,
        status: stripeResponse.status || 'unknown',
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to retrieve order. Please try again.'
      
      void log.error('Order retrieval failed', { error, paymentId })
      return rejectWithValue(errorMessage)
    }
  },
)

export const orderCancel = createAsyncThunk(
  'order/orderCancel',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      if (!paymentId || typeof paymentId !== 'string') {
        throw new Error('Invalid payment ID provided')
      }

      // Step 1: Cancel payment intent with Stripe
      let stripeStatus = 'canceled'
      try {
        const stripeDelRes = await deletePaymentIntent(paymentId)
        stripeStatus = stripeDelRes?.status || 'canceled'
      } catch (stripeError) {
        void log.warn('Failed to cancel Stripe payment intent, continuing with order cancellation', {
          error: stripeError,
          paymentId,
        })
        // Continue with order cancellation even if Stripe cancellation fails
      }

      // Step 2: Update order status on server
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
        // If server update fails but Stripe was canceled, still report success
        // but log the error
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
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to cancel order. Please try again.'
      
      void log.error('Order cancellation failed', { error, paymentId })
      return rejectWithValue(errorMessage)
    }
  },
)
