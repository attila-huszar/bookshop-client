import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  IStateOrder,
  IPostPaymentIntent,
  IOrder,
  OrderStatus,
} from '@/interfaces'
import { getPaymentIntent, postCreateOrder, postPaymentIntent } from '@/api'

const initialState: IStateOrder = {
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
      // .addCase(orderRetrieve.fulfilled, (state, action) => {
      //   state.orderStatus = {
      //     intent: 'processing',
      //     paymentId: action.payload.clientSecret.split('_secret_')[0],
      //     clientSecret: action.payload.clientSecret,
      //     amount: action.payload.amount,
      //     currency: action.payload.currency,
      //   }
      //   state.orderIsLoading = false
      //   state.orderRetrieveError = undefined
      // })
      .addCase(orderRetrieve.rejected, (state, action) => {
        state.order = null
        state.orderIsLoading = false
        state.orderRetrieveError = action.error.message
      })
  },
})

export const orderCreate = createAsyncThunk(
  'orderCreate',
  async (order: {
    orderToStripe: IPostPaymentIntent
    orderToServer: IOrder
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

    const clientSecret = stripeResponse.client_secret
    const amount = stripeResponse.amount
    const currency = stripeResponse.currency
    return {
      clientSecret,
      amount,
      currency,
    }
  },
)

export const orderReducer = orderSlice.reducer
export const { orderClear } = orderSlice.actions
