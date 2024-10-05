import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BasketButton } from './BasketButton'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useCart } from '@/hooks'

describe('BasketButton', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppSelector).mockReturnValue({
      orderStatus: null,
    })

    vi.mocked(useCart).mockReturnValue({
      cartArray: [
        {
          id: 1,
          title: 'Book 1',
          price: 10,
          discount: 10,
          imgUrl: 'test1.jpg',
          quantity: 1,
        },
        {
          id: 2,
          title: 'Book 2',
          price: 20,
          discount: 20,
          imgUrl: 'test2.jpg',
          quantity: 2,
        },
      ],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      addQuantity: vi.fn(),
      removeQuantity: vi.fn(),
      setQuantity: vi.fn(),
    })
  })

  it('should navigate to the cart page when the button is clicked', async () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    render(<BasketButton />)

    await userEvent.click(screen.getByRole('button', { name: /basket/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/cart')
  })

  it('should display the correct item count in the cart', () => {
    render(<BasketButton />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should not display item count if the cart is empty', () => {
    vi.mocked(useCart).mockReturnValue({
      cartArray: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      addQuantity: vi.fn(),
      removeQuantity: vi.fn(),
      setQuantity: vi.fn(),
    })

    render(<BasketButton />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('should display Checkout if there is one in progress', () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAppSelector).mockReturnValue({
      orderStatus: { clientSecret: 'test' },
    })

    render(<BasketButton />)

    const button = screen.getByRole('button', { name: /checkout/i })
    expect(button).toBeInTheDocument()
  })
})
