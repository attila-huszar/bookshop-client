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
  paymentRetrieveError: null,
  paymentCancelError: null,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentClear: (state) => {
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
      })
      .addCase(paymentCreate.fulfilled, (state, action) => {
        state.payment = {
          session: action.payload.session,
          amount: action.payload.amount,
        }
        state.paymentIsLoading = false
        state.paymentCreateError = null
      })
      .addCase(paymentCreate.rejected, (state, action) => {
        state.payment = null
        state.paymentIsLoading = false
        state.paymentCreateError =
          action.error.message ?? 'Failed to create payment'
      })
      .addCase(paymentRetrieve.pending, (state) => {
        state.paymentIsLoading = true
        state.paymentRetrieveError = null
      })
      .addCase(paymentRetrieve.fulfilled, (state, action) => {
        state.payment = {
          session: action.payload.session,
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
      })
      .addCase(paymentCancel.rejected, (state, action) => {
        state.paymentIsLoading = false
        state.paymentCancelError =
          action.error.message ?? 'Failed to cancel payment'
      })
  },
})

export const paymentReducer = paymentSlice.reducer
export const { paymentClear } = paymentSlice.actions
