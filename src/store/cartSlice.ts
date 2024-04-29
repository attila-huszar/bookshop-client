import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import { fetchBooks } from '../api/fetchData'
import { IBook, ICart, ICartStore, ILocalCart } from '../interfaces'

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

      if (existingItemIdx === -1) {
        state.cartData = [...state.cartData, cartItem]
      }
    },
    cartClear: (state) => {
      state.cartData = []
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.cartIsLoading = true
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartData = action.payload
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
      const book: IBook = await fetchBooks(`${item.id}`, rejectWithValue)
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
} = cartSlice.actions
