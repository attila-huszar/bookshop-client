import { createSlice } from '@reduxjs/toolkit'
import { orderCreate, orderRetrieve, orderCancel } from '../thunks/order'
import { OrderState, OrderStatus } from '@/types'

const initialState: OrderState = {
  order: null,
  orderIsLoading: false,
  orderCreateError: null,
  orderRetrieveError: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    orderClear: (state) => {
      state.order = null
      state.orderIsLoading = false
      state.orderCreateError = null
      state.orderRetrieveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderCreate.pending, (state) => {
        state.orderIsLoading = true
        state.orderCreateError = null
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
        state.orderCreateError = null
      })
      .addCase(orderCreate.rejected, (state, action) => {
        state.order = null
        state.orderIsLoading = false
        state.orderCreateError =
          action.error.message ?? 'Failed to create order'
      })
      .addCase(orderRetrieve.pending, (state) => {
        state.orderIsLoading = true
        state.orderRetrieveError = null
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
        state.orderRetrieveError = null
      })
      .addCase(orderRetrieve.rejected, (state, action) => {
        state.order = null
        state.orderIsLoading = false
        state.orderRetrieveError =
          action.error.message ?? 'Failed to retrieve order'
      })
      .addCase(orderCancel.fulfilled, (state) => {
        state.order = null
        state.orderIsLoading = false
        state.orderCreateError = null
        state.orderRetrieveError = null
      })
  },
})

export const orderReducer = orderSlice.reducer
export const { orderClear } = orderSlice.actions
