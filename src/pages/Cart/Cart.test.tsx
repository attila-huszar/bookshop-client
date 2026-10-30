import { Provider } from 'react-redux'
import { MemoryRouter, useNavigate } from 'react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartRestored } from '@/store/slices/cart'
import { checkoutReady } from '@/store/slices/payment'
import { createAppStore } from '@/store/store'
import { toast } from '@/components/AppToaster'
import { useCart } from '@/hooks/useCart'
import { startCheckout } from '@/services/checkout'
import { HttpErrorCode } from '@/types/ApiError'
import { Cart } from './Cart'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))
vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }))
vi.mock('@/services/checkout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/checkout')>()),
  startCheckout: vi.fn(),
}))

const items = [
  {
    id: 1,
    title: 'Book 1',
    price: 20,
    discount: 10,
    discountPrice: 18,
    quantity: 2,
    imgUrl: 'book1.jpg',
  },
]
let store: ReturnType<typeof createAppStore>
const navigate = vi.fn()
const refetch = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(toast, 'error').mockReturnValue('test-toast')
  store = createAppStore()
  store.dispatch(cartRestored([{ id: 1, quantity: 2 }]))
  vi.mocked(useNavigate).mockReturnValue(navigate)
  vi.mocked(useCart).mockReturnValue({
    cartItems: items,
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch,
  })
  vi.mocked(startCheckout).mockImplementation(
    () => () => Promise.resolve({ type: 'stale' }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  store.dispatch(bookshopApi.util.resetApiState())
  localStorage.clear()
  sessionStorage.clear()
})

function renderCart() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>,
  )
}

describe('Cart', () => {
  it('shows loading until book details are available', () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch,
    })
    renderCart()

    expect(screen.getByText(/loading cart/i)).toBeVisible()
  })

  it('offers a retry after book details fail', async () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      isLoading: false,
      isFetching: false,
      error: { code: HttpErrorCode.UnknownResponse },
      refetch,
    })
    renderCart()

    expect(screen.getByText(/failed to load your cart/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('shows an empty basket and a shopping action', async () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    })
    renderCart()

    expect(screen.getByText(/your cart is empty/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: /go shopping/i }))
    expect(navigate).toHaveBeenCalledWith('/books')
  })

  it('renders book details and updates quantity intent', async () => {
    renderCart()
    expect(screen.getByText('Book 1')).toBeVisible()

    await userEvent.click(screen.getByTitle('Add quantity'))
    expect(store.getState().cart.cartItems).toEqual([{ id: 1, quantity: 3 }])
    await userEvent.click(screen.getByTitle('Remove quantity'))
    expect(store.getState().cart.cartItems).toEqual([{ id: 1, quantity: 2 }])
  })

  it('submits minimal items with the discounted total', async () => {
    renderCart()
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(startCheckout).toHaveBeenCalledExactlyOnceWith({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })
  })

  it('disables checkout while prices are refreshing', () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: items,
      isLoading: false,
      isFetching: true,
      error: undefined,
      refetch,
    })
    renderCart()

    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled()
  })

  it('uses the same rounded unit price for the line, summary and checkout request', async () => {
    const cartItems = [
      {
        ...items[0]!,
        price: 9.99,
        discount: 20,
        discountPrice: 7.992,
        quantity: 100,
      },
    ]
    store.dispatch(cartRestored([{ id: 1, quantity: 100 }]))
    vi.mocked(useCart).mockReturnValue({
      cartItems,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch,
    })
    renderCart()

    expect(screen.getByText('7.99')).toBeInTheDocument()
    expect(screen.getByText('799')).toBeInTheDocument()
    expect(screen.getByText('$ 799.00')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(startCheckout).toHaveBeenCalledExactlyOnceWith({
      items: [{ id: 1, quantity: 100 }],
      expectedTotal: 799,
    })
  })

  it('navigates to an existing checkout without creating another payment', async () => {
    vi.mocked(startCheckout).mockImplementation(
      () => () => Promise.resolve({ type: 'existing', paymentId: 'pi_saved' }),
    )
    renderCart()
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(navigate).toHaveBeenCalledWith('/checkout', { replace: true })
  })

  it('navigates when the coordinator accepts a ready payment', async () => {
    renderCart()
    act(() => {
      store.dispatch(
        checkoutReady({
          paymentId: 'pi_saved',
          paymentToken: 'secret',
          amount: 3600,
        }),
      )
    })

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/checkout', { replace: true }),
    )
  })

  it('reports failed creation at display time', async () => {
    vi.mocked(startCheckout).mockImplementation(
      () => () => Promise.reject(new Error('Offline')),
    )
    renderCart()
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(toast.error).toHaveBeenCalledWith('Offline', { id: 'payment-error' })
  })

  it('does not report an old error after leaving Cart', async () => {
    let fail!: (error: Error) => void
    vi.mocked(startCheckout).mockImplementation(
      () => () =>
        new Promise((_resolve, reject) => {
          fail = reject
        }),
    )
    const view = renderCart()
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))
    view.unmount()
    await act(async () => {
      fail(new Error('Offline'))
      await Promise.resolve()
    })

    expect(toast.error).not.toHaveBeenCalled()
  })
})
