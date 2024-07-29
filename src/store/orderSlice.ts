import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { postStripePayment, postOrder, updateOrder } from 'api/fetchData'
import { IOrder, IOrderStore, IStripePayment } from 'interfaces'

const initialState: IOrderStore = {
  orderData: null,
  orderStatus: {
    intent: null,
    clientSecret: null,
  },
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
      state.orderData = null
      state.orderStatus = {
        intent: null,
        clientSecret: null,
      }
      state.orderError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderData = action.payload
        state.orderError = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderError = action.payload as SerializedError
        state.orderData = null
      })

      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.orderStatus = {
          intent: 'processing',
          clientSecret: action.payload,
        }
        state.orderError = null
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.orderStatus = {
          intent: null,
          clientSecret: null,
        }
        state.orderError = action.payload as SerializedError
      })
  },
})

export const createOrder = createAsyncThunk(
  'createOrder',
  (order: Partial<IOrder>, { rejectWithValue }) =>
    postOrder(order)
      .then((response) => response)
      .catch((error) => rejectWithValue(error)),
)

export const createPaymentIntent = createAsyncThunk(
  'createPaymentIntent',
  (paymentData: IStripePayment, { rejectWithValue }) =>
    postStripePayment(paymentData)
      .then((response) => response.clientSecret)
      .catch((error) => rejectWithValue(error)),
)

export const orderReducer = orderSlice.reducer
