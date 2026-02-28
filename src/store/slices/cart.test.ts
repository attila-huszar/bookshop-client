import { describe, expect, it } from 'vitest'
import { fetchCartItems } from '@/store/thunks/cart'
import type { Cart, MinimalCart } from '@/types'
import { cartClear, cartReducer } from './cart'

const minimalCartArg: MinimalCart[] = [{ id: 1, quantity: 1 }]

const hydratedCartItems: Cart[] = [
  {
    id: 1,
    title: 'Test Book',
    price: 20,
    discount: 0,
    discountPrice: 20,
    imgUrl: 'test.jpg',
    quantity: 1,
  },
]

describe('cart slice hydration handling', () => {
  it('applies hydrate result on fulfilled', () => {
    const pendingAction = fetchCartItems.pending('request-2', minimalCartArg)
    const fulfilledAction = fetchCartItems.fulfilled(
      hydratedCartItems,
      'request-2',
      minimalCartArg,
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingAction)
    state = cartReducer(state, fulfilledAction)

    expect(state.cartItems).toEqual(hydratedCartItems)
    expect(state.cartIsLoading).toBe(false)
  })

  it('does not set cart error for stale hydration rejection', () => {
    const pendingAction = fetchCartItems.pending('request-3', minimalCartArg)
    const staleRejectedAction = fetchCartItems.rejected(
      null,
      'request-3',
      minimalCartArg,
      'stale-hydration',
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingAction)
    state = cartReducer(state, staleRejectedAction)

    expect(state.cartItems).toEqual([])
    expect(state.cartIsLoading).toBe(false)
    expect(state.cartError).toBeNull()
  })

  it('clears cart immediately with cartClear', () => {
    const pendingAction = fetchCartItems.pending('request-4', minimalCartArg)
    const fulfilledAction = fetchCartItems.fulfilled(
      hydratedCartItems,
      'request-4',
      minimalCartArg,
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingAction)
    state = cartReducer(state, fulfilledAction)
    state = cartReducer(state, cartClear())

    expect(state.cartItems).toEqual([])
    expect(state.cartIsLoading).toBe(false)
    expect(state.cartError).toBeNull()
  })
})
