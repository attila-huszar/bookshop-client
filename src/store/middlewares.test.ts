import { afterEach, describe, expect, it } from 'vitest'
import { sessionStorageAdapter } from '@/helpers'
import { paymentIdKey } from '@/constants'
import { cartAdd } from './slices/cart'
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
  sessionStorageAdapter.remove(paymentIdKey)
})

describe('payment session listeners', () => {
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

    store.dispatch(logout.fulfilled({ success: true }, 'logout_1'))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(store.getState().payment.payment).toBeNull()
    expect(sessionStorageAdapter.get(paymentIdKey)).toBeNull()
  })
})
