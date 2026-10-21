import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useBookQuery } from '@/store/api/bookshopApi'
import { useCart } from '@/hooks/useCart'
import { Product } from './Product'

vi.mock('@/hooks/useCart', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useCart')>()),
  useCart: vi.fn(),
}))

vi.mock('@/components/Price', () => ({
  Price: () => <div>Price</div>,
}))

vi.mock('@/components/Button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}))

vi.mock('@/components/Recommended', () => ({
  Recommended: () => <div>Recommended</div>,
}))

vi.mock('@/store/api/bookshopApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/bookshopApi')>()),
  useBookQuery: vi.fn(),
}))

describe('Product Page', () => {
  const mockBook = {
    id: 1,
    title: 'Test Book',
    imgUrl: 'http://test.com/test-book.jpg',
    price: 10,
    discount: 0,
    description: 'Test description',
    author: 'Test Author',
  }

  beforeEach(() => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      addToCart: vi.fn(),
    } as unknown as ReturnType<typeof useCart>)
  })

  it('should render book details', () => {
    vi.mocked(useBookQuery).mockReturnValue({
      currentData: mockBook,
      isFetching: true,
      isError: false,
    } as unknown as ReturnType<typeof useBookQuery>)

    render(
      <MemoryRouter initialEntries={['/book?id=1']}>
        <Routes>
          <Route path="/book" element={<Product />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('shows loading for a new book without displaying the previous query result', () => {
    vi.mocked(useBookQuery).mockReturnValue({
      data: mockBook,
      currentData: undefined,
      isFetching: true,
      isError: false,
    } as unknown as ReturnType<typeof useBookQuery>)

    render(
      <MemoryRouter initialEntries={['/book?id=2']}>
        <Product />
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading book details')).toBeInTheDocument()
    expect(screen.queryByText('Test Book')).not.toBeInTheDocument()
    expect(screen.queryByText('Book not found')).not.toBeInTheDocument()
  })

  it('should render error alert when book is not found', () => {
    vi.mocked(useBookQuery).mockReturnValue({
      data: undefined,
      isError: true,
    } as unknown as ReturnType<typeof useBookQuery>)

    render(
      <MemoryRouter initialEntries={['/book?id=999']}>
        <Routes>
          <Route path="/book" element={<Product />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Book not found')).toBeInTheDocument()
  })
})
