import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router'
import { Product } from './Product'
import { useAppDispatch, useAppSelector, useCart } from '@/hooks'
import { authorsSelector, booksSelector, fetchBookById } from '@/store'
import { Providers } from '@/setupTests'

vi.mock('@/store', () => ({
  booksSelector: vi.fn(),
  bookByIdSelector: vi.fn(),
  authorsSelector: vi.fn(),
  authorByIdSelector: vi.fn(),
  fetchBookById: vi.fn(),
}))

vi.mock('@/components', () => ({
  Price: () => <div>Price</div>,
  Button: () => <button>Button</button>,
  Recommended: () => <div>Recommended</div>,
  Error: () => <div>Error</div>,
}))

describe('Product Page', () => {
  const mockDispatch = vi.fn()

  const mockBook = {
    id: 1,
    title: 'Test Book',
    imgUrl: 'http://test.com/test-book.jpg',
    price: 10,
    discount: 0,
    description: 'Test description',
    author: 1,
  }

  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ id: '1' })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
    } as unknown as ReturnType<typeof useCart>)
  })

  it('should render book details', () => {
    vi.mocked(useAppSelector).mockReturnValue(mockBook)

    render(<Product />, { wrapper: Providers })

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should call fetchBookById on mount if no book is found', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      switch (selector) {
        case booksSelector:
          return { booksError: 'Error' }
        case authorsSelector:
          return { authorError: 'Error' }
        default:
          return null
      }
    })

    render(<Product />, { wrapper: Providers })

    expect(mockDispatch).toHaveBeenCalledWith(fetchBookById(1))
  })
})
