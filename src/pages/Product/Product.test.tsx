import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useAppSelector, useCart } from '@/hooks'
import { Product } from './Product'

vi.mock('@/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components')>()
  return {
    ...actual,
    Price: () => <div>Price</div>,
    Button: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
    Alert: () => <div>Error Alert</div>,
  }
})

vi.mock('@/components/Recommended/Recommended', () => ({
  Recommended: () => <div>Recommended</div>,
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
    vi.mocked(useAppSelector).mockReturnValue({
      books: [mockBook],
      booksError: null,
    })

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

  it('should render error alert when book is not found', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      books: [],
      booksError: 'Book not found',
    })

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
