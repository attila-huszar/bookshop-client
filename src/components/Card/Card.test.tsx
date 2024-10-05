import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { Card } from './Card'
import { useCart } from '@/hooks'
import { IBook } from '@/interfaces'

describe('Card', () => {
  const mockBook: Partial<IBook> = {
    id: 1,
    title: 'Test Book',
    description: 'Test Description',
    price: 20,
    discount: 5,
    imgUrl: 'test.jpg',
  }

  const mockAddToCart = vi.fn()
  const mockNavigate = vi.fn()

  it('should render book details correctly', () => {
    vi.mocked(useCart).mockReturnValue({
      cartArray: [],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)

    render(
      <MemoryRouter>
        <Card book={mockBook as IBook} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Add to Basket')).toBeInTheDocument()
  })

  it('should call addToCart when the book is not in the cart', async () => {
    vi.mocked(useCart).mockReturnValue({
      cartArray: [],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)

    render(
      <MemoryRouter>
        <Card book={mockBook as IBook} />
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: /add to basket/i })
    await userEvent.click(button)

    expect(mockAddToCart).toHaveBeenCalledWith(mockBook)
  })

  it('should navigate to cart when the book is already in the cart', async () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    vi.mocked(useCart).mockReturnValue({
      cartArray: [mockBook],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)

    render(
      <MemoryRouter>
        <Card book={mockBook as IBook} />
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: /view in basket/i })
    await userEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/cart')
  })
})
