import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import ky from 'ky'
import { vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { store } from '@/store/store'
import { Orders } from '@/pages/Orders/Orders'
import { authLoader } from './authLoader'
import { ordersLoader } from './ordersLoader'

vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/store')>()

  return { ...actual, store: actual.createAppStore() }
})

vi.mock('./authLoader', () => ({ authLoader: vi.fn() }))

const httpResponse = (response: Promise<Response>) =>
  ky.get('https://bookshop.test/mock', { retry: 0, fetch: () => response })

const request = () => new Request('https://bookshop.test/orders')

beforeEach(() => {
  vi.mocked(authLoader).mockResolvedValue(true)
  vi.spyOn(privateApi, 'authRequest').mockImplementation(() =>
    httpResponse(Promise.resolve(new Response('[]'))),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

describe('ordersLoader', () => {
  it('waits for authentication, then starts orders without waiting for the response', async () => {
    let completeAuth!: (allowed: boolean) => void
    vi.mocked(authLoader).mockReturnValue(
      new Promise((resolve) => {
        completeAuth = resolve
      }),
    )
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.mocked(privateApi.authRequest).mockImplementation(() =>
      httpResponse(response),
    )

    const loading = ordersLoader({ request: request() })

    expect(privateApi.authRequest).not.toHaveBeenCalled()
    completeAuth(true)
    await expect(loading).resolves.toBeUndefined()
    expect(
      bookshopApi.endpoints.userOrders.select()(store.getState()).isLoading,
    ).toBe(true)

    completeRequest(new Response('[]'))
    await Promise.all(store.dispatch(bookshopApi.util.getRunningQueriesThunk()))
    expect(privateApi.authRequest).toHaveBeenCalledTimes(1)
  })

  it('does not request private orders when authentication is denied', async () => {
    vi.mocked(authLoader).mockResolvedValue(false)

    await ordersLoader({ request: request() })

    expect(privateApi.authRequest).not.toHaveBeenCalled()
  })

  it('fetches once on entry, reuses the completed preload on mount, and refreshes on return', async () => {
    await ordersLoader({ request: request() })
    await Promise.all(store.dispatch(bookshopApi.util.getRunningQueriesThunk()))
    const view = render(
      <Provider store={store}>
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      </Provider>,
    )

    expect(
      await screen.findByText('You have no orders yet.'),
    ).toBeInTheDocument()
    expect(privateApi.authRequest).toHaveBeenCalledTimes(1)
    view.unmount()

    await ordersLoader({ request: request() })
    await Promise.all(store.dispatch(bookshopApi.util.getRunningQueriesThunk()))

    expect(privateApi.authRequest).toHaveBeenCalledTimes(2)
  })

  it('does not start private orders after navigation is cancelled during auth', async () => {
    let finishAuth!: (allowed: boolean) => void
    vi.mocked(authLoader).mockReturnValue(
      new Promise((resolve) => {
        finishAuth = resolve
      }),
    )
    const controller = new AbortController()
    const loading = ordersLoader({
      request: new Request('https://bookshop.test/orders', {
        signal: controller.signal,
      }),
    })

    controller.abort()
    finishAuth(true)

    await expect(loading).rejects.toMatchObject({ name: 'AbortError' })
    expect(privateApi.authRequest).not.toHaveBeenCalled()
  })
})
