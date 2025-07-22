import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { fetchBookById } from './books'
import type { CartLocalStorage } from '@/types'

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (cartItems: CartLocalStorage[], listenerApi) => {
    const state = listenerApi.getState() as RootState

    const promises = cartItems.map(async (item) => {
      const book =
        state.books.books.find((book) => book.id === item.id) ??
        (await listenerApi.dispatch(fetchBookById(item.id)).unwrap())

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
