import { Providers } from '@/setupTests'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useAppSelector, useCart } from '@/hooks'
import { Products } from './Products'

vi.mock('./components', () => ({
  Filter: () => <div>Filter component</div>,
  EmptyFilterResults: vi.fn(() => <div>No books found</div>),
  Pagination: vi.fn(() => <div>Pagination component</div>),
}))

const createUseCartMock = (): ReturnType<typeof useCart> => ({
  cartItems: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  addQuantity: vi.fn(),
  removeQuantity: vi.fn(),
  setQuantity: vi.fn(),
})

describe('Products Page', () => {
  beforeEach(() => {
    vi.mocked(useCart).mockReturnValue(createUseCartMock())
  })

  it('should render books and pagination when books are present', async () => {
    const booksOnCurrentPage = [
      { id: 1, title: 'Test Book 1' },
      { id: 2, title: 'Test Book 2' },
    ]

    vi.mocked(useAppSelector).mockReturnValue({ booksOnCurrentPage })

    render(<Products />, { wrapper: Providers })

    const cards = await screen.findAllByText(/test book/i)
    expect(cards).toHaveLength(2)
    expect(screen.getByText('Pagination component')).toBeInTheDocument()
  })

  it('should show EmptyFilterResults when no books are found', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage: [],
    })

    render(<Products />)

    expect(screen.getByText('No books found')).toBeInTheDocument()
  })

  it('should render the Filter component', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage: [],
    })

    render(<Products />)

    expect(screen.getByText('Filter component')).toBeInTheDocument()
  })
})
