import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { localStorageAdapter } from '@/helpers'
import { cartKey } from '@/constants'
import type { Cart, MinimalCart } from '@/types'
import { fetchBookById } from './books'

const staleHydrationRejectValue = 'stale-hydration'

const toCartFingerprint = (items: MinimalCart[]) =>
  items.map((item) => `${item.id}:${item.quantity}`).join('|')

const matchesStorageCart = (cartItems: MinimalCart[]): boolean => {
  const storedCart = localStorageAdapter.get<MinimalCart[]>(cartKey)
  if (!Array.isArray(storedCart)) return false
  return toCartFingerprint(storedCart) === toCartFingerprint(cartItems)
}

export const fetchCartItems = createAsyncThunk<
  Cart[],
  MinimalCart[],
  { state: RootState; rejectValue: typeof staleHydrationRejectValue }
>(
  'cart/fetchCartItems',
  async (cartItems, { getState, dispatch, rejectWithValue }) => {
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

    if (!matchesStorageCart(cartItems)) {
      return rejectWithValue(staleHydrationRejectValue)
    }

    return itemsToCart
  },
  {
    condition: (cartItems, { getState }) => {
      const state = getState()
      if (state.cart.cartIsLoading || state.cart.cartItems.length > 0) {
        return false
      }

      return matchesStorageCart(cartItems)
    },
  },
)
