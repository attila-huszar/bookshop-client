import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { booksApi, useBookQuery } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartClear } from '@/store/slices/cart'
import { paymentSessionReset } from '@/store/slices/payment'
import { store } from '@/store/store'
import { paymentCreate } from '@/store/thunks/payment'
import { Cart } from '@/pages/Cart/Cart'
import { BasketButton } from '@/components/Header/components/BasketButton/BasketButton'
import { bootstrapSession } from '@/services/session'
import {
  localStorageAdapter,
  sessionStorageAdapter,
} from '@/helpers/browserStorage'
import { cartKey, paymentIdKey } from '@/constants/keys'
import type { Book } from '@/types'
import { appLoader } from './appLoader'
import { cartLoader } from './cartLoader'

vi.mock('@/routes/route', () => ({
  ROUTE: { CART: 'cart', CHECKOUT: 'checkout' },
}))
vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/store')>()

  return { ...actual, store: actual.createAppStore() }
})
vi.mock('@/services/session', () => ({ bootstrapSession: vi.fn() }))

const book: Book = {
  id: 7,
  title: 'Saved book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: 'book.jpg',
  description: '',
  publishYear: 2026,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}
const cartItems = [{ id: 7, quantity: 2 }]
const bookResponse = () => new Response(JSON.stringify(book))

let view: ReturnType<typeof render> | undefined

let router: ReturnType<typeof createMemoryRouter>

const renderRoute = (path = '/') => {
  router = createMemoryRouter(
    [
      {
        loader: appLoader,
        shouldRevalidate: () => false,
        hydrateFallbackElement: <></>,
        children: [
          ...['/', '/books', '/checkout', '/cms/orders'].map((routePath) => ({
            path: routePath,
            element: <BasketButton />,
          })),
          {
            path: '/cart',
            loader: cartLoader,
            element: <BasketButton />,
          },
        ],
      },
    ],
    { initialEntries: [path] },
  )

  return (view = render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  ))
}

beforeEach(() => {
  localStorageAdapter.set(cartKey, cartItems)
  vi.mocked(bootstrapSession).mockResolvedValue(undefined)
  vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () => Promise.resolve(bookResponse()),
    }),
  )
})

afterEach(() => {
  view?.unmount()
  router.dispose()
  act(() => {
    store.dispatch(cartClear())
    store.dispatch(paymentSessionReset())
    store.dispatch(bookshopApi.util.resetApiState())
  })
  localStorageAdapter.remove(cartKey)
  sessionStorageAdapter.remove(paymentIdKey)
  vi.restoreAllMocks()
})

describe('appLoader saved basket restoration', () => {
  it('mounts page queries after session restoration and shares basket book requests', async () => {
    let finishAuth!: () => void
    const bootstrap = new Promise<void>((resolve) => {
      finishAuth = resolve
    })
    vi.mocked(bootstrapSession).mockReturnValue(bootstrap)
    function BookPage() {
      useBookQuery(7)
      return <BasketButton />
    }
    router = createMemoryRouter(
      [
        {
          loader: appLoader,
          shouldRevalidate: () => false,
          hydrateFallbackElement: <></>,
          children: [{ path: '*', element: <BookPage /> }],
        },
      ],
      { initialEntries: ['/book?id=7'] },
    )
    view = render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    )

    expect(publicApi.baseRequest).not.toHaveBeenCalled()
    await act(async () => {
      store.dispatch(bookshopApi.util.resetApiState())
      finishAuth()
      await bootstrap
    })

    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    expect(bootstrapSession).toHaveBeenCalledTimes(1)
    expect(booksApi.endpoints.book.select(7)(store.getState()).data).toEqual(
      book,
    )
  })

  it.each(['/', '/cms/orders'])(
    'restores the header count on %s without visiting Cart',
    async (path) => {
      renderRoute(path)

      expect(
        await screen.findByRole('button', { name: 'Cart' }),
      ).toBeInTheDocument()
      expect(await screen.findByText('2')).toBeInTheDocument()
      expect(bootstrapSession).toHaveBeenCalledTimes(1)
      expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
      expect(store.getState().cart.cartItems[0]?.quantity).toBe(2)
    },
  )

  it.each(['stored', 'retrieved'] as const)(
    'restores the count while keeping a %s checkout session',
    async (session) => {
      sessionStorageAdapter.set(paymentIdKey, 'pi_saved')

      if (session === 'retrieved') {
        store.dispatch(
          paymentCreate.fulfilled(
            { paymentId: 'pi_saved', paymentToken: 'secret', amount: 2000 },
            'request_saved',
            { items: cartItems, expectedTotal: 20 },
          ),
        )
      }

      renderRoute('/checkout')

      expect(
        await screen.findByRole('button', { name: 'Checkout' }),
      ).toBeInTheDocument()
      expect(await screen.findByText('2')).toBeInTheDocument()
      expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
      expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_saved')
      expect(store.getState().payment.payment?.paymentId).toBe(
        session === 'retrieved' ? 'pi_saved' : undefined,
      )
    },
  )

  it.each(['/', '/cart'])(
    'waits for session bootstrap on %s before starting book requests',
    async (path) => {
      let completeAuth!: () => void
      const auth = new Promise<void>((resolve) => {
        completeAuth = resolve
      })
      vi.mocked(bootstrapSession).mockReturnValue(auth)

      renderRoute(path)

      expect(bootstrapSession).toHaveBeenCalledTimes(1)
      expect(publicApi.baseRequest).not.toHaveBeenCalled()

      await act(async () => {
        store.dispatch(bookshopApi.util.resetApiState())
        completeAuth()
        await auth
      })

      expect(await screen.findByText('2')).toBeInTheDocument()
      expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    },
  )

  it('does not restore cleared items when a book response arrives late', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.mocked(publicApi.baseRequest).mockImplementation(() =>
      ky.get('https://bookshop.test/mock', { retry: 0, fetch: () => response }),
    )

    renderRoute()
    await waitFor(() => expect(publicApi.baseRequest).toHaveBeenCalledTimes(1))

    act(() => {
      store.dispatch(cartClear())
    })
    completeRequest(bookResponse())
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })

    expect(screen.queryByText('2')).not.toBeInTheDocument()
    expect(store.getState().cart.cartItems).toEqual([])
    expect(localStorageAdapter.get(cartKey)).toBeNull()
  })

  it('renders the page while basket requests are still pending', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.mocked(publicApi.baseRequest).mockImplementation(() =>
      ky.get('https://bookshop.test/mock', { retry: 0, fetch: () => response }),
    )

    renderRoute()

    expect(
      await screen.findByRole('button', { name: 'Cart' }),
    ).toBeInTheDocument()
    expect(store.getState().cart.currentRequestId).not.toBeNull()
    expect(screen.queryByText('2')).not.toBeInTheDocument()

    completeRequest(bookResponse())
    expect(await screen.findByText('2')).toBeInTheDocument()
  })

  it('shares bootstrap with Cart before restoring and redirecting to a saved checkout', async () => {
    sessionStorageAdapter.set(paymentIdKey, 'pi_saved')
    let completeAuth!: () => void
    const auth = new Promise<void>((resolve) => {
      completeAuth = resolve
    })
    vi.mocked(bootstrapSession).mockReturnValue(auth)

    renderRoute('/cart')

    expect(bootstrapSession).toHaveBeenCalledTimes(1)
    expect(publicApi.baseRequest).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/cart')

    await act(async () => {
      completeAuth()
      await auth
    })

    expect(
      await screen.findByRole('button', { name: 'Checkout' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/checkout')
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_saved')
  })

  it('keeps the restored basket when navigating between routes', async () => {
    renderRoute()
    expect(await screen.findByText('2')).toBeInTheDocument()

    await act(async () => {
      await router.navigate('/books')
    })

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    expect(bootstrapSession).toHaveBeenCalledTimes(1)
  })

  it('retries failed basket hydration when Cart mounts without repeating startup', async () => {
    vi.mocked(publicApi.baseRequest).mockImplementationOnce(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => Promise.resolve(Response.json({}, { status: 503 })),
      }),
    )
    router = createMemoryRouter([
      {
        loader: appLoader,
        shouldRevalidate: () => false,
        hydrateFallbackElement: <></>,
        children: [
          { path: '/', element: <BasketButton /> },
          { path: '/cart', element: <Cart /> },
        ],
      },
    ])
    view = render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    )
    await waitFor(() => expect(store.getState().cart.cartError).not.toBeNull())
    expect(localStorageAdapter.get(cartKey)).toEqual(cartItems)

    await act(async () => {
      await router.navigate('/cart')
    })

    await waitFor(() =>
      expect(store.getState().cart.cartItems[0]?.quantity).toBe(2),
    )
    expect(store.getState().cart.cartError).toBeNull()
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(2)
    expect(bootstrapSession).toHaveBeenCalledTimes(1)
  })
})
