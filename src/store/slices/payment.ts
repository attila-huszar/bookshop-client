import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ApiError, PaymentSession, PaymentState } from '@/types'

const initialState: PaymentState = {
  payment: null,
  phase: 'idle',
  operationId: null,
  error: null,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    checkoutStarted: (
      state,
      action: PayloadAction<{
        operationId: string
        phase: 'creating' | 'restoring' | 'canceling'
      }>,
    ) => {
      state.operationId = action.payload.operationId
      state.phase = action.payload.phase
      state.error = null

      if (state.phase === 'creating') {
        state.payment = null
      }
    },
    checkoutReady: (state, action: PayloadAction<PaymentSession>) => {
      state.payment = action.payload
      state.phase = 'ready'
      state.operationId = null
      state.error = null
    },
    checkoutFailed: (state, action: PayloadAction<ApiError>) => {
      if (state.phase === 'restoring') {
        state.payment = null
      }

      state.phase = 'failed'
      state.operationId = null
      state.error = action.payload
    },
    checkoutAborted: (state) => {
      state.phase = state.payment ? 'ready' : 'idle'
      state.operationId = null
      state.error = null
    },
    checkoutReset: () => initialState,
  },
})

export const paymentReducer = paymentSlice.reducer
export const {
  checkoutStarted,
  checkoutReady,
  checkoutFailed,
  checkoutAborted,
  checkoutReset,
} = paymentSlice.actions
