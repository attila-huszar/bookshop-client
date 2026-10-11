import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import ky from 'ky'
import { vi } from 'vitest'
import { authRequest } from '@/api'
import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { Orders } from '@/pages/Orders/Orders'
import { authLoader } from './authLoader'
import { ordersLoader } from './ordersLoader'

vi.unmock('@/hooks')
vi.unmock('react-router')

vi.mock('@/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store')>()

  return { ...actual, store: actual.createAppStore() }
})

vi.mock('./authLoader', () => ({ authLoader: vi.fn() }))

const httpResponse = (response: Promise<Response>) =>
  ky.get('https://bookshop.test/mock', { retry: 0, fetch: () => response })

beforeEach(() => {
  vi.mocked(authLoader).mockResolvedValue(true)
  vi.spyOn(authRequest, 'get').mockImplementation(() =>
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
    vi.mocked(authRequest.get).mockImplementation(() => httpResponse(response))

    const loading = ordersLoader()

    expect(authRequest.get).not.toHaveBeenCalled()
    completeAuth(true)
    await expect(loading).resolves.toBeUndefined()
    expect(
      bookshopApi.endpoints.userOrders.select()(store.getState()).isLoading,
    ).toBe(true)

    completeRequest(new Response('[]'))
    await Promise.all(store.dispatch(bookshopApi.util.getRunningQueriesThunk()))
    expect(authRequest.get).toHaveBeenCalledTimes(1)
  })

  it('does not request private orders when authentication is denied', async () => {
    vi.mocked(authLoader).mockResolvedValue(false)

    await ordersLoader()

    expect(authRequest.get).not.toHaveBeenCalled()
  })

  it('fetches once on entry, reuses the completed preload on mount, and refreshes on return', async () => {
    await ordersLoader()
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
    expect(authRequest.get).toHaveBeenCalledTimes(1)
    view.unmount()

    await ordersLoader()
    await Promise.all(store.dispatch(bookshopApi.util.getRunningQueriesThunk()))

    expect(authRequest.get).toHaveBeenCalledTimes(2)
  })
})
