import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  postCreateOrder,
  getPaymentIntent,
  deletePaymentIntent,
  postPaymentIntent,
  updateOrder,
  getAllOrders,
} from '@/api'
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
    currency: string
  }> => {
    const stripeResponse = await postPaymentIntent(order.orderToStripe)
    const clientSecret = stripeResponse.clientSecret
    const paymentId = clientSecret.split('_secret_')[0]

    order.orderToServer.paymentId = paymentId

    const orderResponse = await postCreateOrder(order.orderToServer)

    return {
      clientSecret,
      paymentId: orderResponse.paymentId,
      amount: order.orderToStripe.amount,
      currency: order.orderToStripe.currency,
    }
  },
)

export const orderRetrieve = createAsyncThunk(
  'order/orderRetrieve',
  async (paymentId: string) => {
    const stripeResponse = await getPaymentIntent(paymentId)

    return {
      clientSecret: stripeResponse.client_secret,
      amount: stripeResponse.amount,
      currency: stripeResponse.currency,
      status: stripeResponse.status,
    }
  },
)

export const orderCancel = createAsyncThunk(
  'order/orderCancel',
  async (paymentId: string) => {
    const stripeDelRes = await deletePaymentIntent(paymentId)

    const updateRes = await updateOrder({
      paymentId,
      fields: {
        paymentIntentStatus: stripeDelRes.status,
        orderStatus: OrderStatus.Canceled,
      },
    })

    return {
      orderStatus: updateRes.orderStatus,
    }
  },
)

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async () => {
    const orders = await getAllOrders()
    return orders
  },
)
