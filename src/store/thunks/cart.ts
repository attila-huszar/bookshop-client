import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import type { Cart, MinimalCart } from '@/types'
import { fetchBookById } from './books'

export const fetchCartItems = createAsyncThunk<
  Cart[],
  MinimalCart[],
  { state: RootState }
>('cart/fetchCartItems', async (cartItems, { getState, dispatch }) => {
  const state = getState()

  const promises = cartItems.map(async (item) => {
    const book =
      state.books.books.find((book) => book.id === item.id) ??
      (await dispatch(fetchBookById(item.id)).unwrap())

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

  const allFailed =
    settledItems.length > 0 &&
    settledItems.every((item) => item.status === 'rejected')

  if (allFailed) {
    throw new Error('Failed to fetch cart items')
  }

  return itemsToCart
})
