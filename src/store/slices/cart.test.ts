import { maxItemQuantity } from '@/constants/defaultValues'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartReducer,
  cartRemove,
  cartRestored,
} from './cart'

describe('cart intent', () => {
  it('stores only IDs and quantities even when adding a full book', () => {
    const book = { id: 1, title: 'Book', price: 10 }
    const state = cartReducer(undefined, cartAdd(book))

    expect(state).toEqual({ cartItems: [{ id: 1, quantity: 1 }] })
    expect(cartReducer(state, cartAdd(book))).toBe(state)
  })

  it('restores intent and removes or clears items', () => {
    const state = cartReducer(
      undefined,
      cartRestored([
        { id: 1, quantity: 2 },
        { id: 2, quantity: 1 },
      ]),
    )

    expect(cartReducer(state, cartRemove({ id: 1 })).cartItems).toEqual([
      { id: 2, quantity: 1 },
    ])
    expect(cartReducer(state, cartClear()).cartItems).toEqual([])
  })

  it('increments and decrements within quantity limits', () => {
    let state = cartReducer(undefined, cartAdd({ id: 1 }))
    state = cartReducer(state, cartQuantityRemove({ id: 1 }))
    expect(state.cartItems[0]?.quantity).toBe(1)
    state = cartReducer(state, cartQuantityAdd({ id: 1 }))
    expect(state.cartItems[0]?.quantity).toBe(2)
    state = cartReducer(
      state,
      cartQuantitySet({ cartItem: { id: 1 }, newQuantity: maxItemQuantity }),
    )
    state = cartReducer(state, cartQuantityAdd({ id: 1 }))
    expect(state.cartItems[0]?.quantity).toBe(maxItemQuantity)
  })

  it.each([0, -1, 1.5, NaN, Infinity, maxItemQuantity + 1])(
    'ignores invalid quantity %s',
    (newQuantity) => {
      const state = cartReducer(undefined, cartAdd({ id: 1 }))

      expect(
        cartReducer(
          state,
          cartQuantitySet({ cartItem: { id: 1 }, newQuantity }),
        ),
      ).toBe(state)
    },
  )
})
