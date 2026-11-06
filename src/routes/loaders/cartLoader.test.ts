import { store } from '@/store/store'
import { recoverCheckout, resetCheckout } from '@/services/checkout'
import { cartLoader } from './cartLoader'

beforeEach(() => {
  store.dispatch(resetCheckout())
})
afterEach(() => {
  store.dispatch(resetCheckout())
})

describe('cart checkout redirect', () => {
  it('opens Cart without an active checkout', () => {
    expect(cartLoader()).toBeUndefined()
  })

  it('redirects a saved checkout for restoration', () => {
    store.dispatch(recoverCheckout('pi_saved'))

    expect(cartLoader()?.headers.get('Location')).toBe('/checkout')
  })
})
