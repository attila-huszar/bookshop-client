import { Provider } from 'react-redux'
import { MemoryRouter, useNavigate } from 'react-router'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartRestored } from '@/store/slices/cart'
import { createAppStore } from '@/store/store'
import type { Book } from '@/types'
import { Card } from './Card'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

const book: Book = {
  id: 1,
  title: 'Test Book',
  description: 'Test Description',
  price: 20,
  discount: 5,
  discountPrice: 19,
  imgUrl: 'test.jpg',
  author: 'Author',
  genre: 'Fiction',
  publishYear: 2026,
  rating: 5,
  topSellers: false,
  newRelease: false,
}
let store: ReturnType<typeof createAppStore>
const navigate = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  store = createAppStore()
  vi.mocked(useNavigate).mockReturnValue(navigate)
  vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () => Promise.resolve(Response.json(book)),
    }),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

function renderCard() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Card book={book} />
      </MemoryRouter>
    </Provider>,
  )
}

describe('Card', () => {
  it('renders book details and the add-to-basket action', () => {
    renderCard()

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Add to Basket')).toBeInTheDocument()
  })

  it('prefetches a book on hover or focus and reuses fresh data', async () => {
    renderCard()

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
      expect.objectContaining({ searchParams: { id: 1 } }),
    )

    fireEvent.focus(link)
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
  })

  it('adds basket intent and updates the action', async () => {
    renderCard()
    await userEvent.click(
      screen.getByRole('button', { name: /add to basket/i }),
    )

    expect(store.getState().cart.cartItems).toEqual([{ id: 1, quantity: 1 }])
    expect(
      screen.getByRole('button', { name: /view in basket/i }),
    ).toBeVisible()
  })

  it('navigates to Cart when the book is already in the basket', async () => {
    store.dispatch(cartRestored([{ id: 1, quantity: 2 }]))
    renderCard()
    await userEvent.click(
      screen.getByRole('button', { name: /view in basket/i }),
    )

    expect(navigate).toHaveBeenCalledWith('/cart')
    expect(store.getState().cart.cartItems).toEqual([{ id: 1, quantity: 2 }])
  })
})
