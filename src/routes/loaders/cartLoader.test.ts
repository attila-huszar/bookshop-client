import ky from 'ky'
import { vi } from 'vitest'
import { baseRequest } from '@/api'
import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartClear } from '@/store/slices/cart'
import { paymentSessionReset } from '@/store/slices/payment'
import { paymentCreate } from '@/store/thunks/payment'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdKey } from '@/constants'
import { authLoader } from './authLoader'
import { cartLoader } from './cartLoader'

vi.mock('@/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store')>()

  return { ...actual, store: actual.createAppStore() }
})
vi.mock('./authLoader', () => ({ authLoader: vi.fn() }))

beforeEach(() => {
  vi.mocked(authLoader).mockResolvedValue(true)
})

afterEach(() => {
  store.dispatch(cartClear())
  store.dispatch(paymentSessionReset())
  store.dispatch(bookshopApi.util.resetApiState())
  localStorageAdapter.remove(cartKey)
  sessionStorageAdapter.remove(paymentIdKey)
  vi.restoreAllMocks()
})

describe('cartLoader checkout restoration', () => {
  it.each(['stored', 'retrieved'] as const)(
    'starts restoring after bootstrap and redirects a %s checkout without waiting for books',
    async (session) => {
      const cartItems = [{ id: 7, quantity: 2 }]
      localStorageAdapter.set(cartKey, cartItems)
      sessionStorageAdapter.set(paymentIdKey, 'pi_saved')

      if (session === 'retrieved') {
        store.dispatch(
          paymentCreate.fulfilled(
            { paymentId: 'pi_saved', paymentToken: 'secret', amount: 2000 },
            'request_saved',
            { items: cartItems, expectedTotal: 20 },
          ),
        )
      }

      let completeRequest!: (response: Response) => void
      const response = new Promise<Response>((resolve) => {
        completeRequest = resolve
      })
      vi.spyOn(baseRequest, 'get').mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () => response,
        }),
      )

      const redirect = await cartLoader()

      expect(authLoader).toHaveBeenCalledTimes(1)
      expect(redirect?.headers.get('Location')).toBe('/checkout')
      expect(store.getState().cart.currentRequestId).not.toBeNull()
      completeRequest(new Response(JSON.stringify({ id: 7, price: 10 })))
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      await vi.waitFor(() =>
        expect(store.getState().cart.currentRequestId).toBeNull(),
      )

      expect(store.getState().cart.cartItems[0]?.quantity).toBe(2)
      expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_saved')
    },
  )
})
