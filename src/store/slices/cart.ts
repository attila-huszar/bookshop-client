import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { itemQuantitySchema } from '@/validation/orderSchemas'
import { maxItemQuantity } from '@/constants/defaultValues'
import type { CartItem, CartState } from '@/types'

type CartItemId = Pick<CartItem, 'id'>

const initialState: CartState = { cartItems: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartRestored: (state, action: PayloadAction<CartItem[]>) => {
      state.cartItems = action.payload
    },
    cartAdd: (state, action: PayloadAction<CartItemId>) => {
      if (!state.cartItems.some((item) => item.id === action.payload.id)) {
        state.cartItems.push({ id: action.payload.id, quantity: 1 })
      }
    },
    cartClear: (state) => {
      state.cartItems = []
    },
    cartRemove: (state, action: PayloadAction<CartItemId>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload.id,
      )
    },
    cartQuantityAdd: (state, action: PayloadAction<CartItemId>) => {
      const item = state.cartItems.find((item) => item.id === action.payload.id)

      if (item && item.quantity < maxItemQuantity) {
        item.quantity++
      }
    },
    cartQuantityRemove: (state, action: PayloadAction<CartItemId>) => {
      const item = state.cartItems.find((item) => item.id === action.payload.id)

      if (item && item.quantity > 1) {
        item.quantity--
      }
    },
    cartQuantitySet: (
      state,
      action: PayloadAction<{ cartItem: CartItemId; newQuantity: number }>,
    ) => {
      const { cartItem, newQuantity } = action.payload
      const item = state.cartItems.find((item) => item.id === cartItem.id)

      if (
        item &&
        itemQuantitySchema.isValidSync(newQuantity, { strict: true })
      ) {
        item.quantity = newQuantity
      }
    },
  },
})

export const cartReducer = cartSlice.reducer
export const {
  cartRestored,
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartClear,
} = cartSlice.actions
