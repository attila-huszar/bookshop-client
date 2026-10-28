import { Provider } from 'react-redux'
import { MemoryRouter, useNavigate } from 'react-router'
import { Providers } from '@/testUtils'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { useCart } from '@/hooks/useCart'
import { Book } from '@/types'
import { Card } from './Card'

vi.mock('@/hooks/useCart', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useCart')>()),
  useCart: vi.fn(),
}))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

describe('Card', () => {
  const mockBook: Partial<Book> = {
    id: 1,
    title: 'Test Book',
    description: 'Test Description',
    price: 20,
    discount: 5,
    imgUrl: 'test.jpg',
  }

  beforeEach(() => {
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => Promise.resolve(Response.json(mockBook)),
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockAddToCart = vi.fn()
  const mockNavigate = vi.fn()

  it('should render book details correctly', () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)

    render(
      <Providers>
        <Card book={mockBook as Book} />
      </Providers>,
    )

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Add to Basket')).toBeInTheDocument()
  })

  it('prefetches a book on hover or focus and reuses fresh data', async () => {
    const store = createAppStore()
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)
    const view = render(
      <Provider store={store}>
        <MemoryRouter>
          <Card book={mockBook as Book} />
        </MemoryRouter>
      </Provider>,
    )

    expect(publicApi.baseRequest).not.toHaveBeenCalled()
    const link = screen.getByRole('link')
    fireEvent.mouseEnter(link)
    fireEvent.focus(link)
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    expect(publicApi.baseRequest).toHaveBeenCalledWith(
      'books',
      expect.objectContaining({
        searchParams: { id: 1 },
      }),
    )

    fireEvent.focus(link)
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    view.unmount()
    store.dispatch(bookshopApi.util.resetApiState())
  })

  it('should call addToCart when the book is not in the cart', async () => {
    vi.mocked(useCart).mockReturnValue({
      cartItems: [],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)

    render(
      <Providers>
        <Card book={mockBook as Book} />
      </Providers>,
    )

    const button = screen.getByRole('button', { name: /add to basket/i })
    await userEvent.click(button)

    expect(mockAddToCart).toHaveBeenCalledWith(mockBook)
  })

  it('should navigate to cart when the book is already in the cart', async () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    vi.mocked(useCart).mockReturnValue({
      cartItems: [mockBook],
      addToCart: mockAddToCart,
    } as unknown as ReturnType<typeof useCart>)

    render(
      <Providers>
        <Card book={mockBook as Book} />
      </Providers>,
    )

    const button = screen.getByRole('button', { name: /view in basket/i })
    await userEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/cart')
  })
})
