import { useNavigate } from 'react-router'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { useAppSelector } from '@/hooks'
import { BasketButton } from './BasketButton'

describe('BasketButton', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: {
          cartItems: [
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
        },
        payment: { payment: null },
      }
      return selector(mockState as never)
    })
  })

  it('should navigate to the cart page when the button is clicked', async () => {
    render(<BasketButton />)

    await userEvent.click(screen.getByRole('button', { name: /basket/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/cart')
  })

  it('should display the correct item count in the cart', () => {
    render(<BasketButton />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should not display item count if the cart is empty', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: { cartItems: [] },
        payment: { payment: null },
      }
      return selector(mockState as never)
    })

    render(<BasketButton />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('should display Checkout if there is an order in progress', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState = {
        cart: { cartItems: [] },
        payment: { payment: { session: 'test' } },
      }
      return selector(mockState as never)
    })

    render(<BasketButton />)

    expect(
      screen.getByRole('button', { name: /checkout/i }),
    ).toBeInTheDocument()
  })
})
