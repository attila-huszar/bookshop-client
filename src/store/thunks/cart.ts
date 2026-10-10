import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { localStorageAdapter } from '@/helpers'
import { cartKey } from '@/constants'
import type { Cart, MinimalCart } from '@/types'
import { bookshopApi } from '../api/bookshopApi'

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

  if (!Array.isArray(storedCart)) {
    return false
  }

  return toCartFingerprint(storedCart) === toCartFingerprint(cartItems)
}

export const fetchCartItems = createAsyncThunk<
  Cart[],
  FetchCartItemsArgs,
  { state: RootState; rejectValue: typeof staleHydrationRejectValue }
>(
  'cart/fetchCartItems',
  async ({ cartItems, force = false }, { dispatch, rejectWithValue }) => {
    const promises = cartItems.map(async (item) => {
      const book = await dispatch(
        bookshopApi.endpoints.book.initiate(item.id, {
          subscribe: false,
          forceRefetch: force,
        }),
      ).unwrap()

      return {
        id: book.id,
        title: book.title,
        price: book.price,
        discount: book.discount,
        discountPrice: book.discountPrice,
        imgUrl: book.imgUrl,
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

    if (!force && !matchesStorageCart(cartItems)) {
      return rejectWithValue(staleHydrationRejectValue)
    }

    return itemsToCart
  },
  {
    condition: ({ cartItems, force = false }, { getState }) => {
      const state = getState()

      if (state.cart.currentRequestId !== null && !force) {
        return false
      }

      if (
        !force &&
        toCartFingerprint(cartItems) ===
          toCartFingerprint(toMinimalCart(state.cart.cartItems))
      ) {
        return false
      }

      return force || matchesStorageCart(cartItems)
    },
  },
)

export const refreshCartItems = (cartItems: MinimalCart[]) =>
  fetchCartItems({ cartItems, force: true })
