import { createSlice } from '@reduxjs/toolkit'
import { IBook, ICart, ICartStore } from '../interfaces'

const initialState: ICartStore = {
  cartData: [],
  cartIsLoading: false,
  cartError: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartAdd: (state, action) => {
      const { id, title, price, discount, imgUrl }: IBook = action.payload
      const cartItem: ICart = {
        id,
        quantity: 1,
        title,
        price: Number(price),
        discount,
        imgUrl,
      }

      const existingItemIdx = state.cartData.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (existingItemIdx !== -1) {
        state.cartData[existingItemIdx].quantity++
      } else {
        state.cartData = [...state.cartData, cartItem]
      }
    },
    cartRemove: (state, action) => {
      state.cartData = state.cartData.filter(
        (item) => item.id !== action.payload.id,
      )
    },
    cartQuantityAdd: (state, action) => {
      const itemIdx = state.cartData.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartData[itemIdx].quantity < 50) {
        state.cartData[itemIdx].quantity++
      }
    },
    cartQuantityRemove: (state, action) => {
      const itemIdx = state.cartData.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartData[itemIdx].quantity > 1) {
        state.cartData[itemIdx].quantity--
      }
    },
    cartQuantitySet: (state, action) => {
      const itemIdx = state.cartData.findIndex(
        (item) => item.id === action.payload.item.id,
      )

      if (
        itemIdx !== -1 &&
        action.payload.value >= 1 &&
        action.payload.value <= 50
      ) {
        state.cartData[itemIdx].quantity = action.payload.value
      }
    },
  },
  extraReducers: () => {},
})

export const cartReducer = cartSlice.reducer
export const {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
} = cartSlice.actions
