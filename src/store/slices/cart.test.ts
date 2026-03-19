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
    const pendingAction = fetchCartItems.pending('request-2', {
      cartItems: minimalCartArg,
    })
    const fulfilledAction = fetchCartItems.fulfilled(
      hydratedCartItems,
      'request-2',
      { cartItems: minimalCartArg },
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingAction)
    state = cartReducer(state, fulfilledAction)

    expect(state.cartItems).toEqual(hydratedCartItems)
    expect(state.cartIsLoading).toBe(false)
    expect(state.currentRequestId).toBeNull()
  })

  it('does not set cart error for stale hydration rejection', () => {
    const pendingAction = fetchCartItems.pending('request-3', {
      cartItems: minimalCartArg,
    })
    const staleRejectedAction = fetchCartItems.rejected(
      null,
      'request-3',
      { cartItems: minimalCartArg },
      'stale-hydration',
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingAction)
    state = cartReducer(state, staleRejectedAction)

    expect(state.cartItems).toEqual([])
    expect(state.cartIsLoading).toBe(false)
    expect(state.cartError).toBeNull()
    expect(state.currentRequestId).toBeNull()
  })

  it('ignores stale fulfilled results when a newer request is in flight', () => {
    const pendingActionA = fetchCartItems.pending('request-a', {
      cartItems: minimalCartArg,
    })
    const pendingActionB = fetchCartItems.pending('request-b', {
      cartItems: minimalCartArg,
      force: true,
    })

    const fulfilledActionA = fetchCartItems.fulfilled(
      [
        {
          ...hydratedCartItems[0]!,
          title: 'Old Result',
        },
      ],
      'request-a',
      { cartItems: minimalCartArg },
    )
    const fulfilledActionB = fetchCartItems.fulfilled(
      hydratedCartItems,
      'request-b',
      { cartItems: minimalCartArg, force: true },
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingActionA)
    state = cartReducer(state, pendingActionB)
    state = cartReducer(state, fulfilledActionA)

    expect(state.cartItems).toEqual([])
    expect(state.cartIsLoading).toBe(true)
    expect(state.currentRequestId).toBe('request-b')

    state = cartReducer(state, fulfilledActionB)

    expect(state.cartItems).toEqual(hydratedCartItems)
    expect(state.cartIsLoading).toBe(false)
    expect(state.currentRequestId).toBeNull()
  })

  it('clears cart immediately with cartClear', () => {
    const pendingAction = fetchCartItems.pending('request-4', {
      cartItems: minimalCartArg,
    })
    const fulfilledAction = fetchCartItems.fulfilled(
      hydratedCartItems,
      'request-4',
      { cartItems: minimalCartArg },
    )

    let state = cartReducer(undefined, { type: 'unknown' })
    state = cartReducer(state, pendingAction)
    state = cartReducer(state, fulfilledAction)
    state = cartReducer(state, cartClear())

    expect(state.cartItems).toEqual([])
    expect(state.cartIsLoading).toBe(false)
    expect(state.cartError).toBeNull()
    expect(state.currentRequestId).toBeNull()
  })
})
