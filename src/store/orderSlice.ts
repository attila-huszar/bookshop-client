import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  postCreateOrder,
  getPaymentIntent,
  deletePaymentIntent,
  postPaymentIntent,
  updateOrder,
} from '@/api'
import { OrderStatus } from '@/types'
import type { OrderState, PostPaymentIntent, Order } from '@/types'

const initialState: OrderState = {
  order: null,
  orderIsLoading: false,
  orderCreateError: undefined,
  orderRetrieveError: undefined,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    orderClear: (state) => {
      state.order = null
      state.orderIsLoading = false
      state.orderCreateError = undefined
      state.orderRetrieveError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderCreate.pending, (state) => {
        state.orderIsLoading = true
        state.orderCreateError = undefined
      })
      .addCase(orderCreate.fulfilled, (state, action) => {
        state.order = {
          intent: 'processing',
          status: OrderStatus.Pending,
          paymentId: action.payload.paymentId,
          clientSecret: action.payload.clientSecret,
          amount: action.payload.amount,
          currency: action.payload.currency,
        }
        state.orderIsLoading = false
        state.orderCreateError = undefined
      })
      .addCase(orderCreate.rejected, (state, action) => {
        state.order = null
        state.orderIsLoading = false
        state.orderCreateError = action.error.message
      })
      .addCase(orderRetrieve.pending, (state) => {
        state.orderIsLoading = true
        state.orderRetrieveError = undefined
      })
      .addCase(orderRetrieve.fulfilled, (state, action) => {
        state.order = {
          intent: 'processing',
          status: OrderStatus.Pending,
          paymentId: action.payload.clientSecret.split('_secret_')[0],
          clientSecret: action.payload.clientSecret,
          amount: action.payload.amount,
          currency: action.payload.currency,
        }
        state.orderIsLoading = false
        state.orderRetrieveError = undefined
      })
      .addCase(orderRetrieve.rejected, (state, action) => {
        state.order = null
        state.orderIsLoading = false
        state.orderRetrieveError = action.error.message
      })
      .addCase(orderCancel.fulfilled, (state) => {
        state.order = null
        state.orderIsLoading = false
        state.orderCreateError = undefined
        state.orderRetrieveError = undefined
      })
  },
})

export const orderCreate = createAsyncThunk(
  'orderCreate',
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
  'orderRetrieve',
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
  'orderCancel',
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

export const orderReducer = orderSlice.reducer
export const { orderClear } = orderSlice.actions
