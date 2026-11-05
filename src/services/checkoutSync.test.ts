import { bookshopApi } from '@/store/api/bookshopApi'
import { cartRestored } from '@/store/slices/cart'
import { checkoutReady } from '@/store/slices/payment'
import { createAppStore } from '@/store/store'
import {
  localStorageAdapter,
  sessionStorageAdapter,
} from '@/helpers/browserStorage'
import { cartKey, paymentIdKey } from '@/constants/keys'
import { recoverCheckout, resetCheckout } from './checkout'
import { listenForCheckoutChanges } from './checkoutSync'

const items = [{ id: 7, quantity: 1 }]
let store: ReturnType<typeof createAppStore>
let stop: () => void

beforeEach(() => {
  localStorage.clear()
  store = createAppStore()
  localStorageAdapter.set(cartKey, items)
  store.dispatch(cartRestored(items))
  store.dispatch(recoverCheckout('pi_shared'))
  store.dispatch(
    checkoutReady({
      paymentId: 'pi_shared',
      paymentToken: 'secret',
      amount: 1200,
    }),
  )
  stop = listenForCheckoutChanges(store.dispatch, () => store.getState())
})

afterEach(() => {
  stop()
  store.dispatch(bookshopApi.util.resetApiState())
  localStorage.clear()
  sessionStorage.clear()
})

const storageEvent = (key: string | null, storageArea = localStorage) => {
  window.dispatchEvent(new StorageEvent('storage', { key, storageArea }))
}

describe('checkout synchronization across tabs', () => {
  it('clears the paid basket and obsolete payment form when another tab finishes', () => {
    const secondTab = createAppStore()
    secondTab.dispatch(resetCheckout())
    localStorageAdapter.remove(cartKey)

    storageEvent(paymentIdKey)
    storageEvent(cartKey)

    expect(store.getState().cart.cartItems).toEqual([])
    expect(store.getState().payment.payment).toBeNull()
    expect(store.getState().payment.phase).toBe('idle')
  })

  it('discards a superseded session without deleting the other tab checkout', () => {
    localStorageAdapter.set(paymentIdKey, 'pi_new')
    localStorageAdapter.set(cartKey, [{ id: 7, quantity: 2 }])
    storageEvent(paymentIdKey)

    expect(store.getState().payment.payment).toBeNull()
    expect(localStorageAdapter.get(paymentIdKey)).toBe('pi_new')
    expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 2 }])
  })

  it('reads the latest storage when an older event is delivered', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: paymentIdKey,
        oldValue: 'pi_shared',
        newValue: 'pi_old',
        storageArea: localStorage,
      }),
    )

    expect(store.getState().payment.payment?.paymentId).toBe('pi_shared')
  })

  it.each(['focus', 'pageshow', 'visibilitychange'])(
    'synchronizes a background tab on %s without a storage event',
    (event) => {
      localStorageAdapter.remove(paymentIdKey)
      localStorageAdapter.remove(cartKey)
      const target = event === 'visibilitychange' ? document : window
      target.dispatchEvent(new Event(event))

      expect(store.getState().payment.payment).toBeNull()
      expect(store.getState().cart.cartItems).toEqual([])
    },
  )

  it('ignores unrelated storage and removes listeners on cleanup', () => {
    localStorageAdapter.remove(paymentIdKey)
    sessionStorageAdapter.set(paymentIdKey, 'pi_other')
    storageEvent('language')
    storageEvent(paymentIdKey, sessionStorage)
    expect(store.getState().payment.payment?.paymentId).toBe('pi_shared')

    stop()
    storageEvent(paymentIdKey)
    expect(store.getState().payment.payment?.paymentId).toBe('pi_shared')
  })
})
