import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { postStripePayment, postOrder } from 'api/fetchData'
import { ICreateOrder, IOrderStore } from 'interfaces'

const initialState: IOrderStore = {
  orderStatus: {
    intent: null,
    clientSecret: undefined,
    amount: null,
    currency: null,
  },
  orderIsLoading: false,
  orderError: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    updateOrderStatus: (state, action) => {
      state.orderStatus.intent = action.payload
    },
    clearOrder: (state) => {
      state.orderStatus = {
        intent: null,
        clientSecret: undefined,
        amount: null,
        currency: null,
      }
      state.orderError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderIsLoading = true
        state.orderError = null
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
        state.orderError = action.payload as SerializedError
      })
  },
})

export const createOrder = createAsyncThunk(
  'createOrder',
  async (
    order: ICreateOrder,
    { rejectWithValue },
  ): Promise<{
    clientSecret: string
    amount: number
    currency: string
  }> => {
    try {
      const stripeResponse = await postStripePayment(order.orderToStripe)
      const clientSecret = stripeResponse.clientSecret

      order.orderToServer.paymentId = clientSecret.split('_secret_')[0]

      await postOrder(order.orderToServer)

      return {
        clientSecret,
        amount: order.orderToStripe.amount,
        currency: order.orderToStripe.currency,
      }
    } catch (error) {
      throw rejectWithValue(error)
    }
  },
)

export const orderReducer = orderSlice.reducer
