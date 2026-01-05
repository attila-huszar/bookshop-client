import { createSlice } from '@reduxjs/toolkit'
import { orderCreate, orderRetrieve, orderCancel } from '../thunks/order'
import { OrderState } from '@/types'

const initialState: OrderState = {
  order: null,
  orderIsLoading: false,
  orderCreateError: null,
  orderRetrieveError: null,
  orderCancelError: null,
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
      state.orderCancelError = null
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
          paymentSession: action.payload.paymentSession,
          amount: action.payload.amount,
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
          paymentSession: action.payload.paymentSession,
          amount: action.payload.amount,
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
      .addCase(orderCancel.pending, (state) => {
        state.orderIsLoading = true
        state.orderCancelError = null
      })
      .addCase(orderCancel.fulfilled, (state) => {
        state.order = null
        state.orderIsLoading = false
        state.orderCreateError = null
        state.orderRetrieveError = null
        state.orderCancelError = null
      })
      .addCase(orderCancel.rejected, (state, action) => {
        state.orderIsLoading = false
        state.orderCancelError =
          action.error.message ?? 'Failed to cancel order'
      })
  },
})

export const orderReducer = orderSlice.reducer
export const { orderClear } = orderSlice.actions
