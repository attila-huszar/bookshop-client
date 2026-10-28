import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import * as publicApi from '@/api/baseRequest'
import { useBookQuery } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartClear } from '@/store/slices/cart'
import { store } from '@/store/store'
import { BasketButton } from '@/components/Header/components/BasketButton/BasketButton'
import { recoverCheckout, resetCheckout } from '@/services/checkout'
import { bootstrapSession } from '@/services/session'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { cartKey } from '@/constants/keys'
import { appLoader } from './appLoader'
import { cartLoader } from './cartLoader'

vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/store')>()

  return { ...actual, store: actual.createAppStore() }
})
vi.mock('@/services/session', () => ({ bootstrapSession: vi.fn() }))

let router: ReturnType<typeof createMemoryRouter> | undefined

beforeEach(() => {
  localStorageAdapter.set(cartKey, [{ id: 7, quantity: 2 }])
  vi.mocked(bootstrapSession).mockResolvedValue(undefined)
})

afterEach(() => {
  router?.dispose()
  act(() => {
    store.dispatch(cartClear())
    store.dispatch(resetCheckout())
    store.dispatch(bookshopApi.util.resetApiState())
  })
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

function renderRoute(path = '/', page = <BasketButton />) {
  router = createMemoryRouter(
    [
      {
        loader: appLoader,
        shouldRevalidate: () => false,
        hydrateFallbackElement: <></>,
        children: [
          { path: '/cart', loader: cartLoader, element: page },
          { path: '*', element: page },
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

describe('startup cart restoration', () => {
  it.each(['/', '/cms/orders'])(
    'restores the header on %s without fetching books',
    async (path) => {
      const request = vi.spyOn(publicApi, 'baseRequest')
      renderRoute(path)

      expect(await screen.findByText('2')).toBeInTheDocument()
      expect(request).not.toHaveBeenCalled()
      expect(bootstrapSession).toHaveBeenCalledTimes(1)
      expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 2 }])
    },
  )

  it('keeps the saved checkout while restoring intent', async () => {
    store.dispatch(recoverCheckout('pi_saved'))
    renderRoute('/checkout')

    expect(
      await screen.findByRole('button', { name: 'Checkout' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(store.dispatch(recoverCheckout(null))).toBe('pi_saved')
  })

  it('does not repeat bootstrap when navigating between routes', async () => {
    renderRoute()
    await screen.findByText('2')

    await act(async () => {
      await router?.navigate('/books')
    })

    expect(bootstrapSession).toHaveBeenCalledTimes(1)
  })

  it('restores an empty cart when any saved item is invalid', async () => {
    localStorageAdapter.set(cartKey, [
      { id: 7, quantity: 2 },
      { id: 8, quantity: 0 },
    ])
    await appLoader()

    expect(store.getState().cart.cartItems).toEqual([])
  })

  it.each([
    { name: 'malformed JSON', saved: 'invalid-json' },
    { name: 'numeric strings', saved: [{ id: '7', quantity: '2' }] },
    { name: 'missing quantity', saved: [{ id: 7 }] },
    {
      name: 'unsafe IDs',
      saved: [{ id: Number.MAX_SAFE_INTEGER + 1, quantity: 2 }],
    },
    { name: 'null items', saved: [null] },
    {
      name: 'unexpected fields',
      saved: [{ id: 7, quantity: 2, title: 'Old book details' }],
    },
  ])('does not repair saved carts containing $name', async ({ saved }) => {
    localStorageAdapter.set(cartKey, saved)
    await appLoader()

    expect(store.getState().cart.cartItems).toEqual([])
  })

  it('mounts page queries after bootstrap, while cart restoration itself makes no requests', async () => {
    let finish!: () => void
    vi.mocked(bootstrapSession).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve
      }),
    )
    const request = vi
      .spyOn(publicApi, 'baseRequest')
      .mockImplementation(() => {
        throw new TypeError('Offline')
      })
    function BookPage() {
      useBookQuery(7)

      return <BasketButton />
    }
    renderRoute('/book?id=7', <BookPage />)
    expect(request).not.toHaveBeenCalled()
    await act(async () => {
      finish()
      await Promise.resolve()
    })

    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(request).toHaveBeenCalledTimes(1)
  })
})
