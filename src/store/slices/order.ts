import { createSlice } from '@reduxjs/toolkit'
import { orderCreate, orderRetrieve, orderCancel } from '../thunks/order'
import { OrderState, OrderStatus } from '@/types'

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
        state.orderCreateError = action.error?.message
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
        state.orderRetrieveError = action.error?.message
      })
      .addCase(orderCancel.fulfilled, (state) => {
        state.order = null
        state.orderIsLoading = false
        state.orderCreateError = undefined
        state.orderRetrieveError = undefined
      })
  },
})

export const orderReducer = orderSlice.reducer
export const { orderClear } = orderSlice.actions
