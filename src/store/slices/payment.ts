import { createSlice } from '@reduxjs/toolkit'
import {
  paymentCancel,
  paymentCreate,
  paymentRetrieve,
} from '@/store/thunks/payment'
import { getApiError } from '@/helpers/errors'
import { PaymentState } from '@/types'

const initialState: PaymentState = {
  payment: null,
  paymentIsLoading: false,
  paymentCreateError: null,
  paymentCreateIssueCode: null,
  paymentRetrieveError: null,
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
          action.payload?.apiError ??
          action.payload?.message ??
          'checkout.createError'
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
          getApiError(action.error) ??
          action.error.message ??
          'checkout.error'
      })
      .addCase(paymentCancel.pending, (state) => {
        state.paymentIsLoading = true
      })
      .addCase(paymentCancel.fulfilled, () => initialState)
      .addCase(paymentCancel.rejected, (state) => {
        state.paymentIsLoading = false
      })
  },
})

export const paymentReducer = paymentSlice.reducer
export const { paymentSessionReset, paymentCreateReset } = paymentSlice.actions
