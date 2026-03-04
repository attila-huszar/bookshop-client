import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { localStorageAdapter } from '@/helpers'
import { cartKey } from '@/constants'
import type { Cart, MinimalCart } from '@/types'
import { fetchBookById } from './books'

const staleHydrationRejectValue = 'stale-hydration'

type FetchCartItemsArgs = {
  cartItems: MinimalCart[]
  force?: boolean
}

const toCartFingerprint = (items: MinimalCart[]) =>
  items.map((item) => `${item.id}:${item.quantity}`).join('|')

const toMinimalCart = (items: Cart[]): MinimalCart[] =>
  items.map((item) => ({ id: item.id, quantity: item.quantity }))

const matchesStorageCart = (cartItems: MinimalCart[]): boolean => {
  const storedCart = localStorageAdapter.get<MinimalCart[]>(cartKey)
  if (!Array.isArray(storedCart)) return false
  return toCartFingerprint(storedCart) === toCartFingerprint(cartItems)
}

export const fetchCartItems = createAsyncThunk<
  Cart[],
  FetchCartItemsArgs,
  { state: RootState; rejectValue: typeof staleHydrationRejectValue }
>(
  'cart/fetchCartItems',
  async ({ cartItems }, { getState, dispatch, rejectWithValue }) => {
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
    condition: ({ cartItems, force = false }, { getState }) => {
      const state = getState()
      if (state.cart.cartIsLoading) {
        return false
      }

      if (
        !force &&
        toCartFingerprint(cartItems) ===
          toCartFingerprint(toMinimalCart(state.cart.cartItems))
      ) {
        return false
      }

      return matchesStorageCart(cartItems)
    },
  },
)
