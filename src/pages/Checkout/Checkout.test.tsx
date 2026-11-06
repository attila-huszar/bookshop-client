import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import { bookshopApi } from '@/store/api/bookshopApi'
import { usersApi } from '@/store/api/usersApi'
import { cartClear } from '@/store/slices/cart'
import { checkoutReady } from '@/store/slices/payment'
import { authSessionChanged } from '@/store/slices/user'
import { createAppStore } from '@/store/store'
import { toast } from '@/components/AppToaster'
import {
  listenForCheckoutChanges,
  recoverCheckout,
  resetCheckout,
} from '@/services/checkout'
import { log } from '@/services/logger'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { paymentIdKey } from '@/constants/keys'
import { uiTiming } from '@/constants/time'
import { UserRole } from '@/types'
import * as checkoutComponents from './components'
import { Checkout } from './Checkout'

vi.mock('@stripe/stripe-js', () => ({ loadStripe: vi.fn() }))
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('./components', () => ({
  AddressForm: () => <p>Shipping form</p>,
  CheckoutForm: () => <p>Payment form</p>,
}))
vi.mock('./components/PaymentStatus/PaymentStatus', () => ({
  PaymentStatus: () => <p>Payment result</p>,
}))

let store: ReturnType<typeof createAppStore>
let stopCheckoutSync: (() => void) | undefined

beforeEach(() => {
  localStorage.clear()
  store = createAppStore()
  store.dispatch(recoverCheckout('pi_saved'))
  store.dispatch(
    checkoutReady({
      paymentId: 'pi_saved',
      paymentToken: 'secret',
      amount: 2000,
    }),
  )
})

afterEach(() => {
  stopCheckoutSync?.()
  stopCheckoutSync = undefined
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  localStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function renderCheckout(path = '/checkout') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('checkout session readiness', () => {
  it('waits for the signed-in profile before mounting Stripe forms with address defaults', async () => {
    store.dispatch(authSessionChanged('access-token'))
    renderCheckout()

    expect(screen.getByText('Loading your checkout')).toBeInTheDocument()
    expect(screen.queryByText('Shipping form')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment form')).not.toBeInTheDocument()

    await act(async () => {
      await store.dispatch(
        usersApi.util.upsertQueryData('userProfile', undefined, {
          uuid: 'user',
          firstName: 'Reader',
          lastName: 'One',
          email: 'reader@example.com',
          country: 'hu',
          phone: null,
          address: null,
          avatar: null,
          role: UserRole.User,
        }),
      )
    })

    expect(await screen.findByText('Shipping form')).toBeInTheDocument()
    expect(screen.getByText('Payment form')).toBeInTheDocument()
  })

  it('allows guest checkout without a profile', () => {
    renderCheckout()

    expect(screen.getByText('Shipping form')).toBeInTheDocument()
    expect(screen.getByText('Payment form')).toBeInTheDocument()
  })

  it('shows a Stripe return result without waiting for account details', async () => {
    store.dispatch(authSessionChanged('access-token'))
    renderCheckout('/checkout?redirect_status=succeeded')

    expect(await screen.findByText('Payment result')).toBeInTheDocument()
    expect(screen.queryByText('Shipping form')).not.toBeInTheDocument()
  })

  it('shows one unavailable notice before returning home without a payment session', () => {
    vi.useFakeTimers()
    store.dispatch(resetCheckout())
    renderCheckout()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checkout is no longer available. Returning to the home page...',
    )
    expect(screen.queryByText('Shipping form')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment form')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(uiTiming.checkoutRedirectMs)
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('logs a Stripe render failure and shows the unavailable notice without a toast', () => {
    vi.useFakeTimers()
    const error = new Error('Stripe could not render')
    const logError = vi.spyOn(log, 'error')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(checkoutComponents, 'CheckoutForm').mockImplementation(() => {
      throw error
    })
    renderCheckout()

    expect(logError).toHaveBeenCalledWith('Stripe checkout failed', { error })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Checkout is no longer available. Returning to the home page...',
    )
    expect(toast).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(uiTiming.checkoutRedirectMs)
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})

describe('checkout updates from another tab', () => {
  beforeEach(() => {
    stopCheckoutSync = listenForCheckoutChanges(store)
  })

  it.each(['storage', 'focus'])(
    'replaces obsolete forms with a loading screen before returning home on %s',
    (event) => {
      vi.useFakeTimers()
      renderCheckout()

      act(() => {
        createAppStore().dispatch(cartClear())
        window.dispatchEvent(
          event === 'storage'
            ? new StorageEvent('storage', {
                key: paymentIdKey,
                storageArea: localStorage,
              })
            : new Event('focus'),
        )
      })

      expect(screen.getByRole('status')).toHaveTextContent(
        'This checkout was updated in another tab. Returning to the home page...',
      )
      expect(screen.queryByText('Shipping form')).not.toBeInTheDocument()
      expect(screen.queryByText('Payment form')).not.toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(uiTiming.checkoutRedirectMs - 1)
      })
      expect(screen.queryByText('Home page')).not.toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(screen.getByText('Home page')).toBeInTheDocument()
    },
  )

  it('waits until the tab is visible before starting the redirect delay', () => {
    vi.useFakeTimers()
    const visibility = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden')
    renderCheckout()

    act(() => {
      createAppStore().dispatch(cartClear())
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: paymentIdKey,
          storageArea: localStorage,
        }),
      )
    })

    act(() => {
      vi.advanceTimersByTime(uiTiming.checkoutRedirectMs * 2)
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'This checkout was updated in another tab.',
    )
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()

    visibility.mockReturnValue('visible')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
      vi.advanceTimersByTime(uiTiming.checkoutRedirectMs - 1)
    })
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('preserves a newer checkout in the other tab when redirecting home', () => {
    vi.useFakeTimers()
    renderCheckout()

    act(() => {
      createAppStore().dispatch(recoverCheckout('pi_new'))
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: paymentIdKey,
          storageArea: localStorage,
        }),
      )
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'This checkout was updated in another tab.',
    )

    act(() => {
      vi.advanceTimersByTime(uiTiming.checkoutRedirectMs)
    })
    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(localStorageAdapter.get(paymentIdKey)).toBe('pi_new')
  })

  it('keeps the payment result when this tab clears its own checkout', async () => {
    renderCheckout('/checkout?redirect_status=succeeded')
    expect(await screen.findByText('Payment result')).toBeInTheDocument()
    vi.useFakeTimers()

    act(() => {
      store.dispatch(cartClear())
      vi.advanceTimersByTime(uiTiming.checkoutRedirectMs * 2)
    })

    expect(screen.getByText('Payment result')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })
})
