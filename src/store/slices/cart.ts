import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchCartItems } from '@/store/thunks/cart'
import { maxItemQuantity } from '@/constants'
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
      const { id, title, price, discount, discountPrice, imgUrl } =
        action.payload
      const cartItem: Cart = {
        id,
        title,
        price,
        discount,
        discountPrice,
        imgUrl,
        quantity: 1,
      }

      const existingIdx = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (existingIdx === -1) {
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
      const idx = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (idx !== -1) {
        const item = state.cartItems[idx]
        if (item && item.quantity < maxItemQuantity) item.quantity++
      }
    },
    cartQuantityRemove: (state, action: PayloadAction<Cart>) => {
      const idx = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (idx !== -1) {
        const item = state.cartItems[idx]
        if (item && item.quantity > 1) item.quantity--
      }
    },
    cartQuantitySet: (
      state,
      action: PayloadAction<{ cartItem: Cart; newQuantity: number }>,
    ) => {
      const idx = state.cartItems.findIndex(
        (item) => item.id === action.payload.cartItem.id,
      )

      if (
        idx !== -1 &&
        action.payload.newQuantity >= 1 &&
        action.payload.newQuantity <= maxItemQuantity
      ) {
        const item = state.cartItems[idx]
        if (item) item.quantity = action.payload.newQuantity
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
