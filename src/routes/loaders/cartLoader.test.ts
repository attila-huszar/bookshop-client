import { paymentSessionReset } from '@/store/slices/payment'
import { store } from '@/store/store'
import { paymentCreate } from '@/store/thunks/payment'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { paymentIdKey } from '@/constants/keys'
import { cartLoader } from './cartLoader'

afterEach(() => {
  store.dispatch(paymentSessionReset())
  sessionStorageAdapter.remove(paymentIdKey)
})

describe('cart checkout redirect', () => {
  it('opens Cart when there is no active checkout', () => {
    expect(cartLoader()).toBeUndefined()
  })

  it.each(['stored', 'retrieved'] as const)(
    'redirects a %s checkout immediately',
    (session) => {
      if (session === 'stored') {
        sessionStorageAdapter.set(paymentIdKey, 'pi_saved')
      } else {
        store.dispatch(
          paymentCreate.fulfilled(
            { paymentId: 'pi_saved', paymentToken: 'secret', amount: 2000 },
            'request_saved',
            { items: [{ id: 7, quantity: 2 }], expectedTotal: 20 },
          ),
        )
      }

      expect(cartLoader()?.headers.get('Location')).toBe('/checkout')
    },
  )
})
