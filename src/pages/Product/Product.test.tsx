import { createMemoryRouter, RouterProvider } from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { productLoader } from '@/routes/loaders/productLoader'
import { bookshopApi, useBookQuery } from '@/store/api/bookshopApi'
import { useCart } from '@/hooks/useCart'
import { Product } from './Product'

let router: ReturnType<typeof createMemoryRouter> | undefined

const renderProduct = (path: string) => {
  router = createMemoryRouter(
    [
      {
        path: '/book',
        loader: productLoader,
        element: <Product />,
        hydrateFallbackElement: <></>,
      },
    ],
    { initialEntries: [path] },
  )

  return render(<RouterProvider router={router} />)
}

afterEach(() => {
  router?.dispose()
})

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
    vi.spyOn(bookshopApi.util, 'prefetch').mockImplementation(
      () => () => undefined,
    )
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      addToCart: vi.fn(),
    } as unknown as ReturnType<typeof useCart>)
  })

  it('should render book details', async () => {
    vi.mocked(useBookQuery).mockReturnValue({
      currentData: mockBook,
      isFetching: true,
      isError: false,
    } as unknown as ReturnType<typeof useBookQuery>)

    renderProduct('/book?id=1')

    expect(await screen.findByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('shows loading for a new book without displaying the previous query result', async () => {
    vi.mocked(useBookQuery).mockReturnValue({
      data: mockBook,
      currentData: undefined,
      isFetching: true,
      isError: false,
    } as unknown as ReturnType<typeof useBookQuery>)

    renderProduct('/book?id=2')

    expect(await screen.findByText('Loading book details')).toBeInTheDocument()
    expect(screen.queryByText('Test Book')).not.toBeInTheDocument()
    expect(screen.queryByText('Book not found')).not.toBeInTheDocument()
  })

  it('should render error alert when book is not found', async () => {
    vi.mocked(useBookQuery).mockReturnValue({
      data: undefined,
      isError: true,
    } as unknown as ReturnType<typeof useBookQuery>)

    renderProduct('/book?id=999')

    expect(await screen.findByText('Book not found')).toBeInTheDocument()
  })

  it.each(['/book', '/book?id=Infinity', '/book?id=-1', '/book?id=1.5'])(
    'shows not found and skips the query for an invalid URL (%s)',
    async (path) => {
      const prefetch = vi.spyOn(bookshopApi.util, 'prefetch')
      vi.mocked(useBookQuery).mockReturnValue({
        currentData: undefined,
        isFetching: false,
        isError: false,
      } as unknown as ReturnType<typeof useBookQuery>)

      renderProduct(path)

      expect(await screen.findByText('Book not found')).toBeInTheDocument()
      expect(useBookQuery).toHaveBeenLastCalledWith(
        skipToken,
        expect.any(Object),
      )
      expect(prefetch).not.toHaveBeenCalled()
    },
  )
})
