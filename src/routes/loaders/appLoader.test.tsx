import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import ky from 'ky'
import { vi } from 'vitest'
import { baseRequest } from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartClear } from '@/store/slices/cart'
import { paymentSessionReset } from '@/store/slices/payment'
import { store } from '@/store/store'
import { paymentCreate } from '@/store/thunks/payment'
import { BasketButton } from '@/components/Header/components/BasketButton/BasketButton'
import {
  localStorageAdapter,
  sessionStorageAdapter,
} from '@/helpers/browserStorage'
import { cartKey, paymentIdKey } from '@/constants/keys'
import type { Book } from '@/types'
import { appLoader } from './appLoader'
import { authLoader } from './authLoader'
import { cartLoader } from './cartLoader'

vi.mock('@/routes/route', () => ({
  ROUTE: { CART: 'cart', CHECKOUT: 'checkout' },
}))
vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/store')>()

  return { ...actual, store: actual.createAppStore() }
})
vi.mock('./authLoader', () => ({ authLoader: vi.fn() }))

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

let router: ReturnType<typeof createMemoryRouter>

const renderRoute = (path = '/') => {
  router = createMemoryRouter(
    [
      {
        loader: appLoader,
        hydrateFallbackElement: <></>,
        children: [
          ...['/', '/books', '/checkout', '/cms/orders'].map((routePath) => ({
            path: routePath,
            element: <BasketButton />,
          })),
          { path: '/cart', loader: cartLoader, element: <BasketButton /> },
        ],
      },
    ],
    { initialEntries: [path] },
  )

  return render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  )
}

beforeEach(() => {
  localStorageAdapter.set(cartKey, cartItems)
  vi.mocked(authLoader).mockResolvedValue(true)
  vi.spyOn(baseRequest, 'get').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () => Promise.resolve(bookResponse()),
    }),
  )
})

afterEach(() => {
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
  it.each(['/', '/cms/orders'])(
    'restores the header count on %s without visiting Cart',
    async (path) => {
      renderRoute(path)

      expect(
        await screen.findByRole('button', { name: 'Cart' }),
      ).toBeInTheDocument()
      expect(await screen.findByText('2')).toBeInTheDocument()
      expect(authLoader).toHaveBeenCalledTimes(1)
      expect(baseRequest.get).toHaveBeenCalledTimes(1)
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
      expect(baseRequest.get).toHaveBeenCalledTimes(1)
      expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_saved')
      expect(store.getState().payment.payment?.paymentId).toBe(
        session === 'retrieved' ? 'pi_saved' : undefined,
      )
    },
  )

  it.each(['/', '/cart'])(
    'waits for session bootstrap on %s before starting book requests',
    async (path) => {
      let completeAuth!: (allowed: boolean) => void
      const auth = new Promise<boolean>((resolve) => {
        completeAuth = resolve
      })
      vi.mocked(authLoader).mockReturnValue(auth)

      renderRoute(path)

      expect(authLoader).toHaveBeenCalledTimes(1)
      expect(baseRequest.get).not.toHaveBeenCalled()

      await act(async () => {
        store.dispatch(bookshopApi.util.resetApiState())
        completeAuth(true)
        await auth
      })

      expect(await screen.findByText('2')).toBeInTheDocument()
      expect(baseRequest.get).toHaveBeenCalledTimes(1)
    },
  )

  it('does not restore cleared items when a book response arrives late', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.mocked(baseRequest.get).mockImplementation(() =>
      ky.get('https://bookshop.test/mock', { retry: 0, fetch: () => response }),
    )

    renderRoute()
    await waitFor(() => expect(baseRequest.get).toHaveBeenCalledTimes(1))

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
    vi.mocked(baseRequest.get).mockImplementation(() =>
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
    let completeAuth!: (allowed: boolean) => void
    const auth = new Promise<boolean>((resolve) => {
      completeAuth = resolve
    })
    vi.mocked(authLoader).mockReturnValue(auth)

    renderRoute('/cart')

    expect(authLoader).toHaveBeenCalledTimes(1)
    expect(baseRequest.get).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/cart')

    await act(async () => {
      completeAuth(true)
      await auth
    })

    expect(
      await screen.findByRole('button', { name: 'Checkout' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/checkout')
    expect(baseRequest.get).toHaveBeenCalledTimes(1)
    expect(sessionStorageAdapter.get(paymentIdKey)).toBe('pi_saved')
  })

  it('waits for bootstrap again before retrying failed restoration on a later Cart visit', async () => {
    vi.mocked(baseRequest.get).mockImplementationOnce(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => Promise.resolve(new Response('{}', { status: 503 })),
      }),
    )

    renderRoute()
    await waitFor(() =>
      expect(store.getState().cart.cartError).toBe(
        'Failed to load your cart. Please try again.',
      ),
    )
    expect(baseRequest.get).toHaveBeenCalledTimes(1)
    expect(localStorageAdapter.get(cartKey)).toEqual(cartItems)

    let completeAuth!: (allowed: boolean) => void
    const auth = new Promise<boolean>((resolve) => {
      completeAuth = resolve
    })
    vi.mocked(authLoader).mockReturnValue(auth)

    let navigation!: Promise<void>
    act(() => {
      navigation = router.navigate('/cart')
    })

    expect(authLoader).toHaveBeenCalledTimes(2)
    expect(baseRequest.get).toHaveBeenCalledTimes(1)

    await act(async () => {
      completeAuth(true)
      await navigation
    })

    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(baseRequest.get).toHaveBeenCalledTimes(2)
    expect(store.getState().cart.cartError).toBeNull()
  })

  it('keeps the restored basket when navigating between routes', async () => {
    renderRoute()
    expect(await screen.findByText('2')).toBeInTheDocument()

    await act(async () => {
      await router.navigate('/books')
    })

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(baseRequest.get).toHaveBeenCalledTimes(1)
  })
})
