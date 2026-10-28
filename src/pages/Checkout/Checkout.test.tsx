import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import { bookshopApi } from '@/store/api/bookshopApi'
import { usersApi } from '@/store/api/usersApi'
import { authSessionChanged } from '@/store/slices/user'
import { createAppStore } from '@/store/store'
import { paymentCreate } from '@/store/thunks/payment'
import { UserRole } from '@/types'
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

beforeEach(() => {
  store = createAppStore()
  store.dispatch(
    paymentCreate.fulfilled(
      { paymentId: 'pi_saved', paymentToken: 'secret', amount: 2000 },
      'request_saved',
      { items: [{ id: 7, quantity: 2 }], expectedTotal: 20 },
    ),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
})

function renderCheckout(path = '/checkout') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Checkout />
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
})
