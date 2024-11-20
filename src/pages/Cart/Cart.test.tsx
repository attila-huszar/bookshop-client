import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Cart } from './Cart'
import { useCart, useAppSelector, useAppDispatch } from '@/hooks'
import { orderCreate } from '@/store'
import { PATH } from '@/constants'
import { Providers } from '@/setupTests'
import { ICart, ICreateOrder } from '@/interfaces'

vi.mock('@/store', () => ({
  cartSelector: vi.fn(),
  orderSelector: vi.fn(),
  orderCreate: vi.fn(),
}))

describe('Cart component', () => {
  const mockNavigate = vi.fn()
  const mockDispatch = vi.fn()
  const mockCartArray = [
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
      cartArray: mockCartArray,
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
      cartArray: [] as ICart[],
    } as ReturnType<typeof useCart>)

    render(<Cart />, { wrapper: Providers })

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /go shopping/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(mockNavigate).toHaveBeenCalledWith(`/${PATH.CLIENT.books}`)
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
    expect(addQuantity).toHaveBeenCalledWith(mockCartArray[0])

    await userEvent.click(removeButton)
    expect(removeQuantity).toHaveBeenCalledWith(mockCartArray[0])
  })

  it('should handle checkout and dispatch order creation', async () => {
    render(<Cart />, { wrapper: Providers })

    const checkoutButton = screen.getByRole('button', { name: /checkout/i })

    await userEvent.click(checkoutButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        orderCreate({
          orderToStripe: expect.any(Object) as ICreateOrder['orderToStripe'],
          orderToServer: expect.any(Object) as ICreateOrder['orderToServer'],
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
      expect(mockNavigate).toHaveBeenCalledWith(`/${PATH.CLIENT.checkout}`, {
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
