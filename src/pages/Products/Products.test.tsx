import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Products } from './Products'
import { useAppSelector, useCart } from '@/hooks'
import { Providers } from '@/setupTests'

vi.mock('./components', () => ({
  Filter: () => <div>Filter component</div>,
  EmptyFilterResults: vi.fn(() => <div>No books found</div>),
  Pagination: vi.fn(() => <div>Pagination component</div>),
}))

describe('Products Page', () => {
  beforeEach(() => {
    vi.mocked(useCart).mockReturnValue({
      cartArray: [],
    } as unknown as ReturnType<typeof useCart>)
  })

  it('should render books and pagination when books are present', async () => {
    const booksInShop = [
      { id: 1, title: 'Test Book 1' },
      { id: 2, title: 'Test Book 2' },
    ]
    const booksAreLoading = false

    vi.mocked(useAppSelector).mockReturnValue({ booksInShop, booksAreLoading })

    render(<Products />, { wrapper: Providers })

    const cards = await screen.findAllByText(/test book/i)
    expect(cards).toHaveLength(2)
    expect(screen.getByText('Pagination component')).toBeInTheDocument()
  })

  it('should show EmptyFilterResults when no books are found and loading is false', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksInShop: [],
      booksAreLoading: false,
    })

    render(<Products />)

    expect(screen.getByText('No books found')).toBeInTheDocument()
  })

  it('should not render EmptyFilterResults if loading is true', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksInShop: [],
      booksAreLoading: true,
    })

    render(<Products />)

    expect(screen.queryByText('No books found')).not.toBeInTheDocument()
  })

  it('should render the Filter component', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      booksInShop: [],
      booksAreLoading: false,
    })

    render(<Products />)

    expect(screen.getByText('Filter component')).toBeInTheDocument()
  })
})
