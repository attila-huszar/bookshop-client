import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { paginationDefaults } from '@/constants/pagination'
import { CmsTab } from '@/types'
import { bookshopApi } from '../api/bookshopApi'

const initialState = {
  currentPages: {
    [CmsTab.Orders]: 1,
    [CmsTab.Books]: 1,
    [CmsTab.Authors]: 1,
    [CmsTab.Users]: 1,
  },
  itemsPerPage: paginationDefaults.cmsItemsPerPage,
}

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setCmsCurrentPage: (
      state,
      action: PayloadAction<{ tab: CmsTab; page: number }>,
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
