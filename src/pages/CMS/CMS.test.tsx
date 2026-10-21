import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useOutletContext } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ky, { type KyInstance } from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { toast } from '@/components/AppToaster'
import {
  type CmsOrder,
  type CMSOutletContext,
  type CmsUser,
  UserRole,
} from '@/types'
import { CMS } from './CMS'
import { Orders } from './components/Orders/Orders'
import { Users } from './components/Users/Users'

const order: CmsOrder = {
  id: 1,
  paymentId: 'pi_test',
  paymentStatus: 'processing',
  total: 10,
  currency: 'USD',
  items: [],
  firstName: 'Reader',
  lastName: 'One',
  email: 'reader@example.com',
  shipping: null,
  paidAt: null,
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T10:00:00Z',
  deletedAt: null,
}
const account: CmsUser = {
  id: 1,
  uuid: '11111111-1111-4111-8111-111111111111',
  firstName: 'Reader',
  lastName: 'One',
  email: 'reader@example.com',
  country: 'HU',
  role: UserRole.User,
  phone: null,
  address: null,
  avatar: null,
  verified: true,
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T10:00:00Z',
  deletedAt: null,
}
let accounts: CmsUser[]
let store: ReturnType<typeof createAppStore>
let orders: CmsOrder[]
const remove = vi.fn<KyInstance['delete']>()
const restore = vi.fn<KyInstance['patch']>()
const response = (data: unknown) =>
  ky.get('https://bookshop.test/mock', {
    retry: 0,
    fetch: () =>
      Promise.resolve(
        new Response(JSON.stringify(data), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
  })

beforeEach(() => {
  store = createAppStore()
  orders = [order]
  accounts = [account]
  vi.spyOn(toast, 'success')
  vi.spyOn(toast, 'error')
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    },
  )
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open')
  })
  const updateVisibility = (
    deleted: boolean,
    options: { json?: unknown } | undefined,
  ) => {
    const { orderIds = [], userIds = [] } = options?.json as {
      orderIds?: number[]
      userIds?: number[]
    }
    const deletedAt = deleted ? '2026-10-08T12:00:00Z' : null
    orders = orders.map((current) =>
      orderIds.includes(current.id) ? { ...current, deletedAt } : current,
    )
    accounts = accounts.map((current) =>
      userIds.includes(current.id) ? { ...current, deletedAt } : current,
    )

    return response(orderIds.length + userIds.length)
  }
  remove
    .mockReset()
    .mockImplementation((_url, options) => updateVisibility(true, options))
  restore
    .mockReset()
    .mockImplementation((_url, options) => updateVisibility(false, options))
  vi.spyOn(privateApi, 'authRequest').mockImplementation((url, options) => {
    if (options?.method === 'delete') {
      return remove(url, options)
    }

    if (options?.method === 'patch') {
      return restore(url, options)
    }

    return response(
      url === 'cms/users' ? accounts : url === 'cms/orders' ? orders : [],
    )
  })
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

function CatalogSelection({ tab }: { tab: 'books' | 'authors' }) {
  const { setSelectedItems } = useOutletContext<CMSOutletContext>()

  return (
    <button
      onClick={() =>
        setSelectedItems((previous) => ({ ...previous, [tab]: [1] }))
      }>
      Select {tab}
    </button>
  )
}

function renderCMS(tab = 'orders') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/cms/' + tab]}>
        <Routes>
          <Route path="/cms" element={<CMS />}>
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
            <Route path="books" element={<CatalogSelection tab="books" />} />
            <Route
              path="authors"
              element={<CatalogSelection tab="authors" />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('CMS deletion controls', () => {
  it('translates controls and confirmations after a language change without changing request values', async () => {
    renderCMS()
    const selectOrder = await screen.findByRole('checkbox', {
      name: 'Select order #1',
    })

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByRole('link', { name: 'Rendelések' })).toBeInTheDocument()
    await userEvent.click(selectOrder)
    await userEvent.click(screen.getByRole('button', { name: 'Eltávolítás' }))
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(/eltávolítja a kijelölt tételeket/i),
    ).toBeInTheDocument()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Eltávolítás' }),
    )

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith(
        'cms/orders',
        expect.objectContaining({ json: { orderIds: [1] } }),
      )
    })
  })

  it('shows pending confirmation and prevents repeated removal requests', async () => {
    let completeRequest!: (value: Response) => void
    const pending = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    remove.mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => pending,
      }),
    )
    renderCMS()

    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'Select order #1' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    const dialog = screen.getByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: 'Remove' })
    await userEvent.click(confirm)

    expect(dialog).toHaveAttribute('aria-busy', 'true')
    expect(confirm).toBeDisabled()
    expect(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    ).toBeDisabled()
    await userEvent.click(confirm)
    expect(remove).toHaveBeenCalledTimes(1)

    orders = [{ ...order, deletedAt: '2026-10-10T12:00:00Z' }]
    act(() => {
      completeRequest(
        new Response('1', {
          headers: { 'content-type': 'application/json' },
        }),
      )
    })

    expect(await screen.findByText('No orders found')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each(['orders', 'users'] as const)(
    'soft deletes and restores %s through the query cache',
    async (entity) => {
      const user = userEvent.setup()
      const singular = entity === 'orders' ? 'order' : 'user'
      const selection = 'Select ' + singular + ' #1'
      const json = { [singular + 'Ids']: [1] }
      renderCMS(entity)
      await user.click(await screen.findByRole('checkbox', { name: selection }))
      await user.click(screen.getByRole('button', { name: 'Remove' }))
      expect(screen.getByRole('dialog')).toHaveTextContent(
        'You can restore them from the removed ' + entity + ' view.',
      )
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Remove',
        }),
      )
      await screen.findByText('No ' + entity + ' found')

      expect(remove).toHaveBeenCalledWith(
        'cms/' + entity,
        expect.objectContaining({ json }),
      )
      const endpoint =
        entity === 'orders'
          ? bookshopApi.endpoints.cmsOrders
          : bookshopApi.endpoints.cmsUsers
      expect(
        endpoint.select()(store.getState()).data?.[0]?.deletedAt,
      ).toBeTruthy()
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully removed selected ' + entity,
      )

      await user.click(
        screen.getByRole('button', { name: 'Show removed ' + entity }),
      )
      expect(
        screen.getByRole('button', { name: 'Show active ' + entity }),
      ).toHaveAttribute('aria-pressed', 'true')
      await user.click(screen.getByRole('checkbox', { name: selection }))
      await user.click(screen.getByRole('button', { name: 'Restore' }))
      expect(screen.getByRole('dialog')).toHaveTextContent(
        'They will appear in the active list again.',
      )
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Restore',
        }),
      )
      await screen.findByText('No deleted ' + entity + ' found')

      expect(restore).toHaveBeenLastCalledWith(
        'cms/restore/' + entity,
        expect.objectContaining({ json }),
      )
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully restored selected ' + entity,
      )
      await user.click(
        screen.getByRole('button', { name: 'Show active ' + entity }),
      )
      expect(
        screen.getByRole('button', { name: 'Show removed ' + entity }),
      ).toHaveAttribute('aria-pressed', 'false')
      expect(
        screen.getByRole('checkbox', { name: selection }),
      ).toBeInTheDocument()
    },
  )

  it.each(['orders', 'users'] as const)(
    'clears selection when switching %s views',
    async (entity) => {
      orders = [order, { ...order, id: 2, deletedAt: '2026-10-08T12:00:00Z' }]
      accounts = [
        account,
        {
          ...account,
          id: 2,
          uuid: '22222222-2222-4222-8222-222222222222',
          deletedAt: '2026-10-08T12:00:00Z',
        },
      ]
      const user = userEvent.setup()
      const singular = entity === 'orders' ? 'order' : 'user'
      renderCMS(entity)
      await user.click(
        await screen.findByRole('checkbox', {
          name: 'Select ' + singular + ' #1',
        }),
      )
      await user.click(
        screen.getByRole('button', { name: 'Show removed ' + entity }),
      )

      expect(
        screen.queryByRole('checkbox', { name: 'Select ' + singular + ' #1' }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: 'Select ' + singular + ' #2' }),
      ).not.toBeChecked()
      await user.click(screen.getByRole('button', { name: 'Restore' }))
      expect(toast).toHaveBeenCalledWith(
        'No items selected',
        expect.any(Object),
      )
      expect(restore).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    },
  )

  it.each(['orders', 'users'] as const)(
    'leaves %s visible when soft deletion fails',
    async (entity) => {
      remove.mockRejectedValueOnce(new Error('Server unavailable'))
      const user = userEvent.setup()
      const selection =
        'Select ' + (entity === 'orders' ? 'order' : 'user') + ' #1'
      renderCMS(entity)
      await user.click(await screen.findByRole('checkbox', { name: selection }))
      await user.click(screen.getByRole('button', { name: 'Remove' }))
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Remove',
        }),
      )
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to remove selected ' + entity,
        ),
      )
      expect(
        screen.getByRole('checkbox', { name: selection }),
      ).toBeInTheDocument()
    },
  )

  it.each(['books', 'authors'] as const)(
    'labels permanent %s deletion explicitly',
    async (entity) => {
      const user = userEvent.setup()
      renderCMS(entity)
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Show removed ' + entity }),
      ).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Select ' + entity }))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveTextContent('This action is irreversible.')
      expect(dialog).toHaveTextContent('These records cannot be restored.')
      expect(remove).not.toHaveBeenCalled()
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      expect(restore).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Delete',
        }),
      )
      await waitFor(() =>
        expect(remove).toHaveBeenCalledWith(
          'cms/' + entity,
          expect.objectContaining({
            json: { [entity === 'books' ? 'bookIds' : 'authorIds']: [1] },
          }),
        ),
      )
    },
  )
})
