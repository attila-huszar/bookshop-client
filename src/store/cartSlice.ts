import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getBookById } from '@/api'
import type { Book, Cart, CartState, CartLocalStorage } from '@/types'

const initialState: CartState = {
  cartArray: [],
  cartIsLoading: false,
  cartError: undefined,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartAdd: (state, action: { payload: Book }) => {
      const { id, title, price, discount, imgUrl } = action.payload
      const cartItem: Cart = {
        id,
        quantity: 1,
        title,
        price,
        discount,
        imgUrl,
      }

      const existingItemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (existingItemIdx === -1) {
        state.cartArray = [...state.cartArray, cartItem]
      }
    },
    cartClear: (state) => {
      state.cartArray = []
      state.cartIsLoading = false
      state.cartError = undefined
    },
    cartRemove: (state, action: { payload: Cart }) => {
      state.cartArray = state.cartArray.filter(
        (item) => item.id !== action.payload.id,
      )
    },
    cartQuantityAdd: (state, action: { payload: Cart }) => {
      const itemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartArray[itemIdx].quantity < 50) {
        state.cartArray[itemIdx].quantity++
      }
    },
    cartQuantityRemove: (state, action: { payload: Cart }) => {
      const itemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartArray[itemIdx].quantity > 1) {
        state.cartArray[itemIdx].quantity--
      }
    },
    cartQuantitySet: (
      state,
      action: { payload: { cartItem: Cart; newQuantity: number } },
    ) => {
      const itemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.cartItem.id,
      )

      if (
        itemIdx !== -1 &&
        action.payload.newQuantity >= 1 &&
        action.payload.newQuantity <= 50
      ) {
        state.cartArray[itemIdx].quantity = action.payload.newQuantity
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.cartIsLoading = true
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartArray = action.payload
        state.cartIsLoading = false
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.cartError = action.error.message
        state.cartIsLoading = false
      })
  },
})

export const fetchCartItems = createAsyncThunk(
  'fetchCartItems',
  async (cartArray: CartLocalStorage[]) => {
    const promises = cartArray.map(async (item) => {
      const book: Book = await getBookById(item.id)

      const {
        author,
        genre,
        description,
        publishYear,
        rating,
        topSellers,
        newRelease,
        ...rest
      } = book

      return {
        ...rest,
        quantity: item.quantity,
      }
    })

    const settledItems = await Promise.allSettled(promises)

    const itemsToCart = settledItems
      .filter((item) => item.status === 'fulfilled')
      .map((item) => item.value)

    return itemsToCart
  },
)

export const cartReducer = cartSlice.reducer
export const {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartClear,
} = cartSlice.actions
