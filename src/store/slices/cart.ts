import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchCartItems } from '../thunks/cart'
import type { Book, Cart, CartState } from '@/types'

const initialState: CartState = {
  cartItems: [],
  cartIsLoading: false,
  cartError: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartAdd: (state, action: PayloadAction<Book>) => {
      const { id, title, price, discount, imgUrl } = action.payload
      const cartItem: Cart = {
        id,
        quantity: 1,
        title,
        price,
        discount,
        imgUrl,
      }

      const existingItemIdx = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (existingItemIdx === -1) {
        state.cartItems = [...state.cartItems, cartItem]
      }
    },
    cartClear: (state) => {
      state.cartItems = []
      state.cartIsLoading = false
      state.cartError = null
    },
    cartRemove: (state, action: PayloadAction<Cart>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload.id,
      )
    },
    cartQuantityAdd: (state, action: PayloadAction<Cart>) => {
      const itemIdx = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartItems[itemIdx].quantity < 50) {
        state.cartItems[itemIdx].quantity++
      }
    },
    cartQuantityRemove: (state, action: PayloadAction<Cart>) => {
      const itemIdx = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartItems[itemIdx].quantity > 1) {
        state.cartItems[itemIdx].quantity--
      }
    },
    cartQuantitySet: (
      state,
      action: PayloadAction<{ cartItem: Cart; newQuantity: number }>,
    ) => {
      const itemIdx = state.cartItems.findIndex(
        (item) => item.id === action.payload.cartItem.id,
      )

      if (
        itemIdx !== -1 &&
        action.payload.newQuantity >= 1 &&
        action.payload.newQuantity <= 50
      ) {
        state.cartItems[itemIdx].quantity = action.payload.newQuantity
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.cartIsLoading = true
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload
        state.cartIsLoading = false
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.cartError = action.error.message ?? 'Failed to fetch cart items'
        state.cartIsLoading = false
      })
  },
})

export const cartReducer = cartSlice.reducer
export const {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartClear,
} = cartSlice.actions
