import { createSlice } from '@reduxjs/toolkit'
import { fetchUserOrders } from '@/store/thunks/orders'
import type { OrdersState } from '@/types'

const initialState: OrdersState = {
  orders: [],
  ordersIsLoading: false,
  ordersError: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    ordersClear: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.ordersIsLoading = true
        state.ordersError = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.orders = action.payload
        state.ordersIsLoading = false
        state.ordersError = null
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.ordersIsLoading = false
        state.ordersError = action.error.message ?? 'Failed to fetch orders'
      })
  },
})

export const ordersReducer = ordersSlice.reducer
export const { ordersClear } = ordersSlice.actions
