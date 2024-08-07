import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { SerializedError } from '@reduxjs/toolkit'
import { getBookById } from 'api/fetchData'
import { IBook, ICart, ICartStore, ILocalCart } from 'interfaces'

const initialState: ICartStore = {
  cartArray: [],
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

      const existingItemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (existingItemIdx === -1) {
        state.cartArray = [...state.cartArray, cartItem]
      }
    },
    cartClear: (state) => {
      state.cartArray = []
    },
    cartRemove: (state, action) => {
      state.cartArray = state.cartArray.filter(
        (item) => item.id !== action.payload.id,
      )
    },
    cartQuantityAdd: (state, action) => {
      const itemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartArray[itemIdx].quantity < 50) {
        state.cartArray[itemIdx].quantity++
      }
    },
    cartQuantityRemove: (state, action) => {
      const itemIdx = state.cartArray.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (itemIdx !== -1 && state.cartArray[itemIdx].quantity > 1) {
        state.cartArray[itemIdx].quantity--
      }
    },
    cartQuantitySet: (
      state,
      action: { payload: { cartItem: ICart; newQuantity: number } },
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
        state.cartError = action.payload as SerializedError
        state.cartIsLoading = false
      })
  },
})

export const fetchCartItems = createAsyncThunk(
  'fetchCartItems',
  async (cartArray: ILocalCart[], { rejectWithValue }) => {
    const promises = cartArray.map(async (item) => {
      const book: IBook = await getBookById(item.id, rejectWithValue)
      const {
        author,
        genre,
        favorite,
        description,
        yearOfPublishing,
        rating,
        new: isNew,
        topSellers,
        price,
        ...rest
      } = book

      return {
        ...rest,
        price: Number(price),
        quantity: item.quantity,
      }
    })

    const resolvedItems = await Promise.all(promises)
    return resolvedItems
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
