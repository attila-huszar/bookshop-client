import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { ordersApi } from '@/store/api/ordersApi'
import { usersApi } from '@/store/api/usersApi'
import { authSessionChanged } from '@/store/slices/user'
import { createAppStore } from '@/store/store'
import { type Order, UserRole } from '@/types'
import { HttpErrorCode } from '@/types/ApiError'
import { Orders } from './Orders'

const order: Order = {
  id: 11,
  paymentId: 'pi_111',
  paymentStatus: 'succeeded',
  total: 4200,
  currency: 'usd',
  firstName: 'July',
  lastName: 'Smith',
  email: 'july@test.com',
  shipping: null,
  paidAt: '2026-02-20T10:00:00.000Z',
  createdAt: '2026-02-20T09:30:00.000Z',
  updatedAt: '2026-02-20T10:00:00.000Z',
  items: [
    {
      id: 1,
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      imgUrl: 'https://example.com/pragmatic-programmer.jpg',
      price: 2100,
      discount: 0,
      quantity: 2,
    },
  ],
}

const multipleOrders: Order[] = Array.from({ length: 21 }, (_, index) => ({
  ...order,
  id: index + 1,
  paymentId: `pi_order_${index + 1}`,
  createdAt: new Date(Date.UTC(2026, 9, index + 1)).toISOString(),
  items: [],
}))

let store: ReturnType<typeof createAppStore>
let nextResponse: () => Promise<Response>

beforeEach(async () => {
  store = createAppStore()
  store.dispatch(authSessionChanged('access-token'))
  await store.dispatch(
    usersApi.util.upsertQueryData('userProfile', undefined, {
      uuid: 'reader',
      firstName: 'July',
      lastName: 'Smith',
      email: 'july@test.com',
      country: 'HU',
      phone: null,
      address: null,
      avatar: null,
      role: UserRole.User,
    }),
  )
  nextResponse = () => Promise.resolve(Response.json([]))
  vi.spyOn(privateApi, 'authRequest').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () => nextResponse(),
    }),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

const renderOrders = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    </Provider>,
  )

describe('Orders page', () => {
  it('pages newest-first orders in groups of ten without changing shop state or refetching', async () => {
    const user = userEvent.setup()
    nextResponse = () => Promise.resolve(Response.json(multipleOrders))
    renderOrders()

    expect(
      await screen.findByRole('heading', { name: 'Order #21' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(
      screen.getByRole('heading', { name: 'Order #12' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Order #11' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next Page' }))

    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(
      screen.getByRole('heading', { name: 'Order #11' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Order #2' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Last Page' }))

    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(
      screen.getByRole('heading', { name: 'Order #1' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next Page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(screen.getByRole('button', { name: 'First Page' }))

    expect(
      screen.getByRole('heading', { name: 'Order #21' }),
    ).toBeInTheDocument()
    expect(store.getState().books.booksCurrentPage).toBe(1)
    expect(privateApi.authRequest).toHaveBeenCalledOnce()
    expect(
      ordersApi.endpoints.userOrders
        .select()(store.getState())
        .data?.map((item) => item.id),
    ).toEqual(multipleOrders.map((item) => item.id))
  })

  it('returns to an available page when the order collection shrinks', async () => {
    const user = userEvent.setup()
    nextResponse = () => Promise.resolve(Response.json(multipleOrders))
    renderOrders()
    await screen.findByRole('heading', { name: 'Order #21' })
    await user.click(screen.getByRole('button', { name: 'Last Page' }))

    await act(async () => {
      await store.dispatch(
        ordersApi.util.upsertQueryData('userOrders', undefined, [order]),
      )
    })

    expect(
      await screen.findByRole('heading', { name: 'Order #11' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(store.getState().orders.currentPage).toBe(1)
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Next Page' })).toBeDisabled()
  })

  it('shows loading until the first response and then the empty state', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    nextResponse = () => response

    renderOrders()

    expect(screen.getByText(/loading your orders/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/you have no orders yet/i),
    ).not.toBeInTheDocument()

    act(() => {
      completeRequest(Response.json([]))
    })

    expect(
      await screen.findByText(/you have no orders yet/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/loading your orders/i)).not.toBeInTheDocument()
    expect(privateApi.authRequest).toHaveBeenCalledOnce()
  })

  it('renders a coded error and translates it without another request', async () => {
    nextResponse = () =>
      Promise.resolve(
        Response.json(
          { code: HttpErrorCode.Forbidden, message: 'Server diagnostic' },
          { status: 403 },
        ),
      )

    renderOrders()

    expect(
      await screen.findByText(/failed to load your orders/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText('You do not have permission to perform this action.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Server diagnostic')).not.toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(
      screen.getByText('Nincs jogosultsága ehhez a művelethez.'),
    ).toBeInTheDocument()
    expect(privateApi.authRequest).toHaveBeenCalledOnce()
  })

  it('shows cached orders immediately and refreshes on each entry', async () => {
    await store.dispatch(
      ordersApi.util.upsertQueryData('userOrders', undefined, [order]),
    )

    nextResponse = () => Promise.resolve(Response.json([order]))
    const view = renderOrders()

    expect(
      screen.getByRole('heading', { name: /july's recent orders/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/order #11/i)).toBeInTheDocument()
    expect(screen.getByText(/the pragmatic programmer/i)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /the pragmatic programmer/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/status:/i)).toBeInTheDocument()
    expect(screen.getByText(/payment id:/i)).toBeInTheDocument()
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })
    expect(privateApi.authRequest).toHaveBeenCalledTimes(1)
    view.unmount()
    renderOrders()
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })
    expect(privateApi.authRequest).toHaveBeenCalledTimes(2)
  })

  it('keeps cached orders visible during a refresh and settles a failed request', async () => {
    await store.dispatch(
      ordersApi.util.upsertQueryData('userOrders', undefined, [order]),
    )
    let failRequest!: (error: Error) => void
    const response = new Promise<Response>((_resolve, reject) => {
      failRequest = reject
    })
    nextResponse = () => response

    renderOrders()

    expect(screen.getByText(/order #11/i)).toBeInTheDocument()
    expect(screen.queryByText(/loading your orders/i)).not.toBeInTheDocument()

    act(() => {
      failRequest(new Error('Network unavailable'))
    })

    expect(
      await screen.findByText(/failed to load your orders/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/loading your orders/i)).not.toBeInTheDocument()
    expect(privateApi.authRequest).toHaveBeenCalledOnce()
  })
})
