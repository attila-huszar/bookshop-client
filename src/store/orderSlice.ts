import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { postStripePayment, postOrder } from 'api'
import { ICreateOrder, IOrderStore } from 'interfaces'

const initialState: IOrderStore = {
  orderStatus: {
    intent: null,
    clientSecret: undefined,
    amount: null,
    currency: null,
  },
  orderIsLoading: false,
  orderError: undefined,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.orderStatus = {
        intent: null,
        clientSecret: undefined,
        amount: null,
        currency: null,
      }
      state.orderError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderIsLoading = true
        state.orderError = undefined
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderStatus = {
          intent: 'processing',
          clientSecret: action.payload.clientSecret,
          amount: action.payload.amount,
          currency: action.payload.currency,
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderStatus = {
          intent: null,
          clientSecret: undefined,
          amount: null,
          currency: null,
        }
        state.orderIsLoading = false
        state.orderError = action.error.message
      })
  },
})

export const createOrder = createAsyncThunk(
  'createOrder',
  async (
    order: ICreateOrder,
  ): Promise<{
    clientSecret: string
    amount: number
    currency: string
  }> => {
    const stripeResponse = await postStripePayment(order.orderToStripe)
    const clientSecret = stripeResponse.clientSecret

    order.orderToServer.paymentId = clientSecret.split('_secret_')[0]

    await postOrder(order.orderToServer)

    return {
      clientSecret,
      amount: order.orderToStripe.amount,
      currency: order.orderToStripe.currency,
    }
  },
)

export const orderReducer = orderSlice.reducer
