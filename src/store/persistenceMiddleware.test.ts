import * as usersApi from '@/api/users'
import { recoverCheckout, resetCheckout } from '@/services/checkout'
import {
  localStorageAdapter,
  sessionStorageAdapter,
} from '@/helpers/browserStorage'
import { getClientIdempotencyKey } from '@/helpers/checkout'
import { cartKey, paymentIdempotencyKey, paymentIdKey } from '@/constants/keys'
import {
  cartAdd,
  cartClear,
  cartQuantityAdd,
  cartRestored,
} from './slices/cart'
import { checkoutReady } from './slices/payment'
import { createAppStore } from './store'
import { logout } from './thunks/user'

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
  localStorage.clear()
})

function readyCheckout(store: ReturnType<typeof createAppStore>) {
  store.dispatch(recoverCheckout('pi_saved'))
  store.dispatch(
    checkoutReady({
      paymentId: 'pi_saved',
      paymentToken: 'secret',
      amount: 1000,
    }),
  )
}

describe('cart persistence', () => {
  it('persists only intent and clears checkout when the basket changes', () => {
    const store = createAppStore()
    const book = { id: 1, title: 'Book', price: 10 }
    store.dispatch(cartAdd(book))
    readyCheckout(store)

    expect(localStorageAdapter.get(cartKey)).toEqual([{ id: 1, quantity: 1 }])
    expect(Object.values(sessionStorage).join('')).not.toContain('secret')

    store.dispatch(cartQuantityAdd({ id: 1 }))

    expect(localStorageAdapter.get(cartKey)).toEqual([{ id: 1, quantity: 2 }])
    expect(store.getState().payment.phase).toBe('idle')
    expect(sessionStorageAdapter.get(paymentIdKey)).toBeNull()

    store.dispatch(cartClear())
    expect(localStorageAdapter.get(cartKey)).toBeNull()
  })

  it('keeps checkout for unchanged intent and startup restoration', () => {
    const store = createAppStore()
    store.dispatch(cartAdd({ id: 1 }))
    readyCheckout(store)
    store.dispatch(cartAdd({ id: 1 }))
    store.dispatch(cartRestored([{ id: 1, quantity: 1 }]))

    expect(store.getState().payment.payment?.paymentId).toBe('pi_saved')
    expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_saved')
  })

  it('clears the retry key when an attempt is reset', () => {
    const store = createAppStore()
    getClientIdempotencyKey({
      items: [{ id: 1, quantity: 1 }],
      expectedTotal: 10,
    })
    store.dispatch(resetCheckout())

    expect(sessionStorageAdapter.get(paymentIdempotencyKey)).toBeNull()
  })

  it('clears checkout after logout succeeds', async () => {
    const store = createAppStore()
    readyCheckout(store)
    vi.spyOn(usersApi, 'postUserLogout').mockResolvedValue({ success: true })

    await store.dispatch(logout()).unwrap()

    expect(store.getState().payment.payment).toBeNull()
    expect(sessionStorageAdapter.get(paymentIdKey)).toBeNull()
  })
})
