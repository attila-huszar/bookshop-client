import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { bookshopApi } from '../api/bookshopApi'
import { ordersApi } from '../api/ordersApi'

const initialState = { currentPage: 1, itemsPerPage: 10 }

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrdersCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(bookshopApi.util.resetApiState, () => initialState)
    builder.addMatcher(
      ordersApi.endpoints.userOrders.matchFulfilled,
      (state, action) => {
        const totalPages = Math.max(
          1,
          Math.ceil(action.payload.length / state.itemsPerPage),
        )
        state.currentPage = Math.min(state.currentPage, totalPages)
      },
    )
  },
})

export const ordersReducer = ordersSlice.reducer
export const { setOrdersCurrentPage } = ordersSlice.actions
