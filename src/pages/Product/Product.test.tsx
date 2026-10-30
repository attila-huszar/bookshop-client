import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { useBookQuery } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { Product } from './Product'

let router: ReturnType<typeof createMemoryRouter> | undefined
let store: ReturnType<typeof createAppStore>

const renderProduct = (path: string) => {
  router = createMemoryRouter(
    [
      {
        path: '/book',
        element: <Product />,
        hydrateFallbackElement: <></>,
      },
    ],
    { initialEntries: [path] },
  )

  return render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  )
}

afterEach(() => {
  router?.dispose()
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  localStorage.clear()
  sessionStorage.clear()
})

vi.mock('@/components/Price', () => ({
  Price: () => <div>Price</div>,
}))

vi.mock('@/components/Recommended', () => ({
  Recommended: () => <div>Recommended</div>,
}))

vi.mock('@/store/api/booksApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/booksApi')>()),
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
    store = createAppStore()
  })

  it('renders book details and adds the book to the basket', async () => {
    vi.mocked(useBookQuery).mockReturnValue({
      currentData: mockBook,
      isFetching: true,
      isError: false,
    } as unknown as ReturnType<typeof useBookQuery>)

    renderProduct('/book?id=1')

    expect(await screen.findByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: /add to basket/i }),
    )

    expect(store.getState().cart.cartItems).toEqual([{ id: 1, quantity: 1 }])
    expect(
      screen.getByRole('button', { name: /view in basket/i }),
    ).toBeVisible()
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

  it.each(
    [
      '',
      '?id=invalid',
      '?id=0',
      '?id=-1',
      '?id=1.5',
      '?id=Infinity',
      '?id=9007199254740992',
      '?id=0x10',
      '?id=1e2',
      '?id=%20',
    ].map((search) => `/book${search}`),
  )(
    'shows not found and skips the query for an invalid URL (%s)',
    async (path) => {
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
    },
  )
})
