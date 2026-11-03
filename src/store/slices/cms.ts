import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { paginationDefaults } from '@/constants/pagination'
import type { SelectContext } from '@/types'
import { bookshopApi } from '../api/bookshopApi'

const initialState = {
  currentPages: { orders: 1, books: 1, authors: 1, users: 1 },
  itemsPerPage: paginationDefaults.cmsItemsPerPage,
}

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setCmsCurrentPage: (
      state,
      action: PayloadAction<{ tab: keyof SelectContext; page: number }>,
    ) => {
      state.currentPages[action.payload.tab] = action.payload.page
    },
  },
  extraReducers: (builder) => {
    builder.addCase(bookshopApi.util.resetApiState, () => initialState)
  },
})

export const cmsReducer = cmsSlice.reducer
export const { setCmsCurrentPage } = cmsSlice.actions
