import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiHandler } from '@/api/apiHandler'
import { ICreateOrder, IStateOrder } from '@/interfaces'

const initialState: IStateOrder = {
  orderStatus: null,
  orderIsLoading: false,
  orderCreateError: undefined,
  orderRetrieveError: undefined,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    orderClear: (state) => {
      state.orderStatus = null
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
        state.orderStatus = {
          intent: 'processing',
          paymentId: action.payload.clientSecret.split('_secret_')[0],
          clientSecret: action.payload.clientSecret,
          amount: action.payload.amount,
          currency: action.payload.currency,
        }
        state.orderIsLoading = false
        state.orderCreateError = undefined
      })
      .addCase(orderCreate.rejected, (state, action) => {
        state.orderStatus = null
        state.orderIsLoading = false
        state.orderCreateError = action.error.message
      })
      .addCase(orderRetrieve.pending, (state) => {
        state.orderIsLoading = true
        state.orderRetrieveError = undefined
      })
      .addCase(orderRetrieve.fulfilled, (state, action) => {
        state.orderStatus = {
          intent: 'processing',
          paymentId: action.payload.clientSecret.split('_secret_')[0],
          clientSecret: action.payload.clientSecret,
          amount: action.payload.amount,
          currency: action.payload.currency,
        }
        state.orderIsLoading = false
        state.orderRetrieveError = undefined
      })
      .addCase(orderRetrieve.rejected, (state, action) => {
        state.orderStatus = null
        state.orderIsLoading = false
        state.orderRetrieveError = action.error.message
      })
  },
})

export const orderRetrieve = createAsyncThunk(
  'orderRetrieve',
  async (paymentId: string) => {
    const stripeRetrieveResponse = await apiHandler.getStripePayment(paymentId)

    const clientSecret = stripeRetrieveResponse.client_secret
    const amount = stripeRetrieveResponse.amount
    const currency = stripeRetrieveResponse.currency

    return {
      clientSecret,
      amount,
      currency,
    }
  },
)

export const orderCreate = createAsyncThunk(
  'orderCreate',
  async (
    order: ICreateOrder,
  ): Promise<{
    clientSecret: string
    amount: number
    currency: string
  }> => {
    const stripeCreateResponse = await apiHandler.postStripePayment(
      order.orderToStripe,
    )
    const clientSecret = stripeCreateResponse.clientSecret
    const paymentId = clientSecret.split('_secret_')[0]

    order.orderToServer.paymentId = paymentId
    await apiHandler.postOrder(order.orderToServer)

    return {
      clientSecret,
      amount: order.orderToStripe.amount,
      currency: order.orderToStripe.currency,
    }
  },
)

export const orderReducer = orderSlice.reducer
export const { orderClear } = orderSlice.actions
