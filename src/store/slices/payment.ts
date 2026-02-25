import { createSlice } from '@reduxjs/toolkit'
import {
  orderSyncAfterWebhook,
  paymentCancel,
  paymentCreate,
  paymentRetrieve,
} from '@/store/thunks/payment'
import { PaymentState } from '@/types'

const initialState: PaymentState = {
  payment: null,
  paymentIsLoading: false,
  paymentCreateError: null,
  paymentRetrieveError: null,
  paymentCancelError: null,
  orderSyncIsLoading: false,
  orderSyncError: null,
  orderSyncIssueCode: null,
  orderSync: null,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentStateReset: (state) => {
      state.payment = null
      state.paymentIsLoading = false
      state.paymentCreateError = null
      state.paymentRetrieveError = null
      state.paymentCancelError = null
      state.orderSyncIsLoading = false
      state.orderSyncError = null
      state.orderSyncIssueCode = null
      state.orderSync = null
    },
    paymentSessionReset: (state) => {
      state.payment = null
      state.paymentIsLoading = false
      state.paymentCreateError = null
      state.paymentRetrieveError = null
      state.paymentCancelError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(paymentCreate.pending, (state) => {
        state.paymentIsLoading = true
        state.paymentCreateError = null
        state.orderSyncIsLoading = false
        state.orderSyncError = null
        state.orderSyncIssueCode = null
        state.orderSync = null
      })
      .addCase(paymentCreate.fulfilled, (state, action) => {
        state.payment = {
          paymentId: action.payload.paymentId,
          paymentToken: action.payload.paymentToken,
          amount: action.payload.amount,
        }
        state.paymentIsLoading = false
        state.paymentCreateError = null
        state.orderSyncIsLoading = false
        state.orderSyncError = null
        state.orderSyncIssueCode = null
        state.orderSync = null
      })
      .addCase(paymentCreate.rejected, (state, action) => {
        state.payment = null
        state.paymentIsLoading = false
        state.paymentCreateError =
          action.error.message ?? 'Failed to create payment'
        state.orderSyncIsLoading = false
        state.orderSyncError = null
        state.orderSyncIssueCode = null
        state.orderSync = null
      })
      .addCase(paymentRetrieve.pending, (state) => {
        state.paymentIsLoading = true
        state.paymentRetrieveError = null
      })
      .addCase(paymentRetrieve.fulfilled, (state, action) => {
        state.payment = {
          paymentId: action.payload.paymentId,
          paymentToken: action.payload.paymentToken,
          amount: action.payload.amount,
        }
        state.paymentIsLoading = false
        state.paymentRetrieveError = null
      })
      .addCase(paymentRetrieve.rejected, (state, action) => {
        state.payment = null
        state.paymentIsLoading = false
        state.paymentRetrieveError =
          action.error.message ?? 'Failed to retrieve payment'
      })
      .addCase(paymentCancel.pending, (state) => {
        state.paymentIsLoading = true
        state.paymentCancelError = null
      })
      .addCase(paymentCancel.fulfilled, (state) => {
        state.payment = null
        state.paymentIsLoading = false
        state.paymentCreateError = null
        state.paymentRetrieveError = null
        state.paymentCancelError = null
        state.orderSyncIsLoading = false
        state.orderSyncError = null
        state.orderSyncIssueCode = null
        state.orderSync = null
      })
      .addCase(paymentCancel.rejected, (state, action) => {
        state.paymentIsLoading = false
        state.paymentCancelError =
          action.error.message ?? 'Failed to cancel payment'
      })
      .addCase(orderSyncAfterWebhook.pending, (state) => {
        state.orderSyncIsLoading = true
        state.orderSyncError = null
        state.orderSyncIssueCode = null
      })
      .addCase(orderSyncAfterWebhook.fulfilled, (state, action) => {
        state.orderSyncIsLoading = false
        state.orderSyncError = null
        state.orderSyncIssueCode = null
        state.orderSync = action.payload
      })
      .addCase(orderSyncAfterWebhook.rejected, (state, action) => {
        state.orderSyncIsLoading = false
        state.orderSyncError = action.error.message ?? 'Failed to sync order'
        state.orderSyncIssueCode = action.error.code ?? 'unknown'
      })
  },
})

export const paymentReducer = paymentSlice.reducer
export const { paymentStateReset, paymentSessionReset } = paymentSlice.actions
