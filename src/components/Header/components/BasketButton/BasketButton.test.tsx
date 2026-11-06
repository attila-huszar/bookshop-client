import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { cartRestored } from '@/store/slices/cart'
import { checkoutReady } from '@/store/slices/payment'
import { createAppStore } from '@/store/store'
import { recoverCheckout } from '@/services/checkout'
import { BasketButton } from './BasketButton'

describe('BasketButton', () => {
  let store: ReturnType<typeof createAppStore>

  beforeEach(() => {
    localStorage.clear()
    store = createAppStore()
    store.dispatch(
      cartRestored([
        { id: 1, quantity: 1 },
        { id: 2, quantity: 2 },
      ]),
    )
  })

  afterEach(() => {
    localStorage.clear()
  })

  const renderBasket = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<BasketButton />} />
            <Route path="/cart" element={<p>Cart page</p>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

  it('shows the item count and opens the cart when clicked', async () => {
    renderBasket()

    expect(screen.getByText('3')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cart' }))

    expect(screen.getByText('Cart page')).toBeInTheDocument()
  })

  it('hides the item count when the cart is empty', () => {
    store.dispatch(cartRestored([]))
    renderBasket()

    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it.each(['stored', 'ready'] as const)(
    'shows Checkout for a %s payment session',
    (phase) => {
      store.dispatch(recoverCheckout('pi_test'))

      if (phase === 'ready') {
        store.dispatch(
          checkoutReady({
            paymentId: 'pi_test',
            paymentToken: 'secret',
            amount: 1200,
          }),
        )
      }

      renderBasket()

      expect(
        screen.getByRole('button', { name: 'Checkout' }),
      ).toBeInTheDocument()
    },
  )
})
