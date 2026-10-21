import { Providers } from '@/testUtils'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useAppSelector } from '@/hooks/redux'
import { useCart } from '@/hooks/useCart'
import { Products } from './Products'

vi.mock('@/hooks/useCart', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useCart')>()),
  useCart: vi.fn(),
}))

vi.mock('@/hooks/redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/redux')>()),
  useAppSelector: vi.fn(),
}))

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
      { id: 1, title: 'Test Book 1', price: 10, discount: 0 },
      { id: 2, title: 'Test Book 2', price: 20, discount: 0 },
    ]

    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage,
      booksError: null,
    })

    render(<Products />, { wrapper: Providers })

    const cards = await screen.findAllByText(/test book/i)

    expect(cards).toHaveLength(2)
    expect(screen.getByText('Pagination component')).toBeInTheDocument()
  })

  it('shows loading instead of empty results while books are being fetched', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage: [],
      booksIsLoading: true,
      booksError: null,
    })

    render(<Products />, { wrapper: Providers })

    expect(screen.getByText('Loading books')).toBeInTheDocument()
    expect(screen.queryByText('No books found')).not.toBeInTheDocument()
  })

  it('should show EmptyFilterResults when no books are found', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage: [],
      booksIsLoading: false,
      booksError: null,
    })

    render(<Products />, { wrapper: Providers })

    expect(screen.getByText('No books found')).toBeInTheDocument()
  })

  it('should render the Filter component', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage: [],
      booksError: null,
    })

    render(<Products />, { wrapper: Providers })

    expect(screen.getByText('Filter component')).toBeInTheDocument()
  })

  it('should show alert when books request fails', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksOnCurrentPage: [],
      booksError: 'Failed to fetch books',
    })

    render(<Products />, { wrapper: Providers })

    expect(screen.getByText(/error loading books/i)).toBeInTheDocument()
    expect(screen.getByText(/failed to fetch books/i)).toBeInTheDocument()
  })
})
