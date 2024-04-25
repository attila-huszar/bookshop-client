import { createSlice } from '@reduxjs/toolkit'
import { ICartStoreState } from '../interfaces'

const initialState: ICartStoreState = {
  cartData: [],
  cartIsLoading: false,
  cartError: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartAdd: (state, action) => {
      state.cartData = [...state.cartData, action.payload]
    },
    cartRemove: (state, action) => {
      state.cartData = state.cartData.filter(
        (item) => item.id !== action.payload.id,
      )
    },
  },
  extraReducers: () => {},
})

export const cartReducer = cartSlice.reducer
export const { cartAdd, cartRemove } = cartSlice.actions
