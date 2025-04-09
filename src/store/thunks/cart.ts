import { createAsyncThunk } from '@reduxjs/toolkit'
import { getBookById } from '@/api'
import type { Book, CartLocalStorage } from '@/types'

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
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
