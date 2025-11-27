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

vi.mock('@/store', () => ({
  cartSelector: vi.fn(),
  orderSelector: vi.fn(),
  orderCreate: vi.fn(),
}))

describe('Cart component', () => {
  const mockNavigate = vi.fn()
  const mockDispatch = vi.fn()
  const mockCartItems = [
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
    } as unknown as ReturnType<typeof useCart>)

    vi.mocked(useAppSelector).mockReturnValue({
      cartIsLoading: false,
      orderIsLoading: false,
      orderStatus: null,
      orderCreateError: null,
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
    vi.mocked(useAppSelector).mockReturnValueOnce({
      cartIsLoading: true,
    })

    render(<Cart />, { wrapper: Providers })

    expect(screen.getByText(/loading cart/i)).toBeInTheDocument()
  })

  it('should display empty cart message when cart is empty', async () => {
    vi.mocked(useCart).mockReturnValueOnce({
      cartItems: [] as CartType[],
    } as ReturnType<typeof useCart>)

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
    const { addQuantity, removeQuantity } = useCart()

    render(<Cart />, { wrapper: Providers })

    const addButton = screen.getByTitle('Add quantity')
    const removeButton = screen.getByTitle('Remove quantity')

    await userEvent.click(addButton)
    expect(addQuantity).toHaveBeenCalledWith(mockCartItems[0])

    await userEvent.click(removeButton)
    expect(removeQuantity).toHaveBeenCalledWith(mockCartItems[0])
  })

  it('should handle checkout and dispatch order creation', async () => {
    render(<Cart />, { wrapper: Providers })

    const checkoutButton = screen.getByRole('button', { name: /checkout/i })

    await userEvent.click(checkoutButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        orderCreate({
          items: [],
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
    vi.mocked(useAppSelector).mockReturnValue({
      cartIsLoading: false,
      orderIsLoading: false,
      orderStatus: { clientSecret: 'secret' },
      orderCreateError: null,
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

    vi.mocked(useAppSelector).mockReturnValue({
      cartIsLoading: false,
      orderIsLoading: false,
      orderStatus: null,
      orderCreateError: null,
    })

    render(<Cart />, { wrapper: Providers })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE.CHECKOUT}`, {
        replace: true,
      })
    })
  })

  it('should display an error toast on order error', async () => {
    vi.mocked(useAppSelector).mockReturnValue({
      cartIsLoading: false,
      orderIsLoading: false,
      orderStatus: {},
      orderCreateError: 'Order failed',
    })

    render(<Cart />, { wrapper: Providers })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Order failed', {
        id: 'order-error',
      })
    })
  })
})
