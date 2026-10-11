import { afterEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdempotencyKey, paymentIdKey } from '@/constants'
import { cartAdd, cartClear } from './slices/cart'
import { paymentSessionReset } from './slices/payment'
import { createAppStore } from './store'
import { paymentCreate } from './thunks/payment'
import { logout } from './thunks/user'

const book = {
  id: 1,
  title: 'Book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: '',
  description: '',
  publishYear: 2024,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorageAdapter.remove(paymentIdKey)
  sessionStorageAdapter.remove(paymentIdempotencyKey)
  localStorageAdapter.remove(cartKey)
})

describe('persistence middleware', () => {
  it('persists only cart intent and safe checkout identifiers', () => {
    const store = createAppStore()
    store.dispatch(cartAdd(book))
    expect(localStorageAdapter.get(cartKey)).toEqual([{ id: 1, quantity: 1 }])

    store.dispatch(
      paymentCreate.fulfilled(
        { paymentId: 'pi_safe', paymentToken: 'private-secret', amount: 1000 },
        'request_safe',
        { items: [{ id: 1, quantity: 1 }], expectedTotal: 10 },
      ),
    )
    expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_safe')
    expect(Object.values(sessionStorage).join('')).not.toContain(
      'private-secret',
    )

    store.dispatch(cartClear())
    expect(localStorageAdapter.get(cartKey)).toBeNull()
    expect(sessionStorageAdapter.get(paymentIdKey)).toBeNull()
  })

  it('preserves a checkout for a cart action that changes no items', () => {
    const store = createAppStore()
    store.dispatch(cartAdd(book))
    store.dispatch(
      paymentCreate.fulfilled(
        { paymentId: 'pi_same', paymentToken: 'secret', amount: 1000 },
        'request_same',
        { items: [{ id: 1, quantity: 1 }], expectedTotal: 10 },
      ),
    )
    store.dispatch(cartAdd(book))

    expect(store.getState().payment.payment?.paymentId).toBe('pi_same')
    expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_same')
  })

  it('discards the idempotency key when checkout resets for a fresh attempt', () => {
    const store = createAppStore()
    sessionStorageAdapter.set(paymentIdempotencyKey, {
      fingerprint: 'old-request',
      clientIdempotencyKey: 'old-attempt',
    })

    store.dispatch(paymentSessionReset())

    expect(sessionStorageAdapter.get(paymentIdempotencyKey)).toBeNull()
  })

  it('resets the active checkout when a cart item changes', async () => {
    const store = createAppStore()
    store.dispatch(
      paymentCreate.fulfilled(
        { paymentId: 'pi_old', paymentToken: 'secret', amount: 1000 },
        'request_1',
        { items: [{ id: 1, quantity: 1 }], expectedTotal: 10 },
      ),
    )

    store.dispatch(cartAdd(book))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(store.getState().payment.payment).toBeNull()
    expect(sessionStorageAdapter.get(paymentIdKey)).toBeNull()
  })

  it('clears the active checkout after logout succeeds', async () => {
    const store = createAppStore()
    store.dispatch(
      paymentCreate.fulfilled(
        { paymentId: 'pi_old', paymentToken: 'secret', amount: 1000 },
        'request_2',
        { items: [{ id: 1, quantity: 1 }], expectedTotal: 10 },
      ),
    )

    vi.spyOn(usersApi, 'postUserLogout').mockResolvedValue({ success: true })
    await store.dispatch(logout()).unwrap()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(store.getState().payment.payment).toBeNull()
    expect(sessionStorageAdapter.get(paymentIdKey)).toBeNull()
  })
})
