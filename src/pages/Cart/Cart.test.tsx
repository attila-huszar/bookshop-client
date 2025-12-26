import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { Cart } from './Cart'
import {
  useCart,
  useAppSelector,
  useAppDispatch,
  useLocalStorage,
} from '@/hooks'
import { orderCreate } from '@/store'
import { ROUTE } from '@/routes'
import { Providers } from '@/setupTests'
import type { Cart as CartType } from '@/types'

vi.mock('@/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store')>()
  return {
    ...actual,
    orderCreate: vi.fn(),
  }
})

const mockCartState = {
  cartItems: [] as CartType[],
  cartIsLoading: false,
  cartError: null,
}

const mockOrderState = {
  order: null as { clientSecret: string } | null,
  orderIsLoading: false,
  orderCreateError: null as string | null,
  orderRetrieveError: null,
  orderCancelError: null,
}

const mockUserState = {
  userData: null,
  accessToken: null,
  userIsLoading: false,
  userIsUpdating: false,
  tokenError: null,
  userError: null,
  loginError: null,
  registerError: null,
}

describe('Cart component', () => {
  const mockNavigate = vi.fn()
  const mockDispatch = vi.fn()
  const mockCartItems: CartType[] = [
    {
      id: 1,
      title: 'Book 1',
      price: 20,
      discount: 10,
      quantity: 2,
      imgUrl: 'book1.jpg',
    },
  ]

  beforeEach(() => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: mockCartItems,
      addQuantity: vi.fn(),
      removeQuantity: vi.fn(),
      setQuantity: vi.fn(),
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
    })

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: mockCartState,
        order: mockOrderState,
        user: mockUserState,
      }
      return selector(mockState as Parameters<typeof selector>[0])
    })

    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    vi.mocked(useLocalStorage).mockReturnValue({
      getFromLocalStorage: vi.fn().mockReturnValue(null),
      setToLocalStorage: vi.fn(),
      removeFromLocalStorage: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading when cart is loading', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: { ...mockCartState, cartIsLoading: true },
        order: mockOrderState,
        user: mockUserState,
      }
      return selector(mockState as Parameters<typeof selector>[0])
    })

    render(<Cart />, { wrapper: Providers })

    expect(screen.getByText(/loading cart/i)).toBeInTheDocument()
  })

  it('should display empty cart message when cart is empty', async () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [] as CartType[],
      addQuantity: vi.fn(),
      removeQuantity: vi.fn(),
      setQuantity: vi.fn(),
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
    })

    render(<Cart />, { wrapper: Providers })

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /go shopping/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE.BOOKS}`)
  })

  it('should render cart items correctly', () => {
    render(<Cart />, { wrapper: Providers })

    expect(screen.getByText('Book 1')).toBeInTheDocument()
    const container = screen.getByText('18').closest('div')
    expect(container).toHaveTextContent('$')
  })

  it('should handle add and remove quantity actions', async () => {
    const mockAddQuantity = vi.fn()
    const mockRemoveQuantity = vi.fn()

    vi.mocked(useCart).mockReturnValue({
      cartItems: mockCartItems,
      addQuantity: mockAddQuantity,
      removeQuantity: mockRemoveQuantity,
      setQuantity: vi.fn(),
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
    })

    render(<Cart />, { wrapper: Providers })

    const addButton = screen.getByTitle('Add quantity')
    const removeButton = screen.getByTitle('Remove quantity')

    await userEvent.click(addButton)
    expect(mockAddQuantity).toHaveBeenCalledWith(mockCartItems[0])

    await userEvent.click(removeButton)
    expect(mockRemoveQuantity).toHaveBeenCalledWith(mockCartItems[0])
  })

  it('should handle checkout and dispatch order creation', async () => {
    render(<Cart />, { wrapper: Providers })

    const checkoutButton = screen.getByRole('button', { name: /checkout/i })

    await userEvent.click(checkoutButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        orderCreate({
          items: [{ id: 1, quantity: 2 }],
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          phone: undefined,
          address: undefined,
        }),
      )
    })
  })

  it('should navigate to checkout on successful order creation', async () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: mockCartState,
        order: { ...mockOrderState, order: { clientSecret: 'secret' } },
        user: mockUserState,
      }
      return selector(mockState as Parameters<typeof selector>[0])
    })

    render(<Cart />, { wrapper: Providers })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE.CHECKOUT}`, {
        replace: true,
      })
    })
  })

  it('should navigate to checkout when clientSecret exists in localStorage', async () => {
    vi.mocked(useLocalStorage).mockReturnValue({
      getFromLocalStorage: vi.fn().mockReturnValue('secret_from_storage'),
      setToLocalStorage: vi.fn(),
      removeFromLocalStorage: vi.fn(),
    })

    render(<Cart />, { wrapper: Providers })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE.CHECKOUT}`, {
        replace: true,
      })
    })
  })

  it('should display an error toast on order error', async () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: mockCartState,
        order: { ...mockOrderState, orderCreateError: 'Order failed' },
        user: mockUserState,
      }
      return selector(mockState as Parameters<typeof selector>[0])
    })

    render(<Cart />, { wrapper: Providers })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Order failed', {
        id: 'order-error',
      })
    })
  })
})
