import { createSlice } from '@reduxjs/toolkit'
import {
  paymentCancel,
  paymentCreate,
  paymentRetrieve,
} from '@/store/thunks/payment'
import { PaymentState } from '@/types'

const initialState: PaymentState = {
  payment: null,
  paymentIsLoading: false,
  paymentCreateError: null,
  paymentCreateIssueCode: null,
  paymentRetrieveError: null,
  paymentCancelError: null,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentSessionReset: () => initialState,
    paymentCreateReset: (state) => {
      state.paymentCreateError = null
      state.paymentCreateIssueCode = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(paymentCreate.pending, (state) => {
        state.paymentIsLoading = true
        state.paymentCreateError = null
        state.paymentCreateIssueCode = null
      })
      .addCase(paymentCreate.fulfilled, (state, action) => {
        state.payment = {
          paymentId: action.payload.paymentId,
          paymentToken: action.payload.paymentToken,
          amount: action.payload.amount,
        }
        state.paymentIsLoading = false
        state.paymentCreateError = null
        state.paymentCreateIssueCode = null
      })
      .addCase(paymentCreate.rejected, (state, action) => {
        state.payment = null
        state.paymentIsLoading = false
        state.paymentCreateError =
          action.payload?.message ?? 'Failed to create payment'
        state.paymentCreateIssueCode = action.payload?.code ?? 'unknown'
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
          action.payload?.message ??
          action.error.message ??
          'Failed to retrieve payment'
      })
      .addCase(paymentCancel.pending, (state) => {
        state.paymentIsLoading = true
        state.paymentCancelError = null
      })
      .addCase(paymentCancel.fulfilled, () => initialState)
      .addCase(paymentCancel.rejected, (state, action) => {
        state.paymentIsLoading = false
        state.paymentCancelError =
          action.error.message ?? 'Failed to cancel payment'
      })
  },
})

export const paymentReducer = paymentSlice.reducer
export const { paymentSessionReset, paymentCreateReset } = paymentSlice.actions
