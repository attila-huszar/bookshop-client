import { Provider } from 'react-redux'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authRequest } from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import type { CmsOrder, CMSOutletContext, EmailOutboxEntry } from '@/types'
import { Orders } from './Orders'

const order: CmsOrder = {
  id: 1,
  paymentId: 'pi_test',
  paymentStatus: 'succeeded',
  total: 10,
  currency: 'USD',
  items: [],
  firstName: 'Reader',
  lastName: 'One',
  email: 'reader@example.com',
  shipping: null,
  paidAt: '2026-10-07T12:00:00Z',
  createdAt: '2026-10-07T11:00:00Z',
  updatedAt: '2026-10-07T12:00:00Z',
  deletedAt: null,
}
const email: EmailOutboxEntry = {
  id: 'confirmation',
  type: 'orderConfirmation',
  recipient: 'receipt@example.com',
  notificationType: null,
  failureReason: null,
  paymentId: 'pi_test',
  status: 'sent',
  queueAttempts: 1,
  deliveryAttempts: 1,
  createdAt: order.createdAt,
  processedAt: order.paidAt,
  deliveryUpdatedAt: order.paidAt,
  nextAttemptAt: null,
  lastError: null,
}
let store: ReturnType<typeof createAppStore>
let emailStatus: EmailOutboxEntry['status']
const context: CMSOutletContext = {
  showDeletedOrders: false,
  showDeletedUsers: false,
  selectedItems: { orders: [], books: [], authors: [], users: [] },
  setSelectedItems: vi.fn(),
  setIsDialogOpen: vi.fn(),
  setIsEditing: vi.fn(),
  setEditedItem: vi.fn(),
}

beforeEach(async () => {
  store = createAppStore()
  emailStatus = 'sent'
  await store.dispatch(
    bookshopApi.util.upsertQueryData('cmsOrders', undefined, [
      order,
      { ...order, id: 2, paymentId: 'pi_test_extra', firstName: 'Reader Two' },
      {
        ...order,
        id: 3,
        paymentId: null,
        paidAt: null,
        paymentStatus: 'processing',
      },
      {
        ...order,
        id: 4,
        paymentId: 'pi_deleted',
        deletedAt: '2026-10-08T12:00:00Z',
      },
    ]),
  )
  vi.spyOn(authRequest, 'get').mockImplementation((_url, options) => {
    const paymentId = (options?.searchParams as { paymentId: string }).paymentId
    const entry =
      paymentId === 'pi_test'
        ? { ...email, status: emailStatus }
        : {
            ...email,
            id: 'other-confirmation',
            paymentId,
            recipient: 'other-receipt@example.com',
          }

    return ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () =>
        Promise.resolve(
          new Response(
            JSON.stringify({ entries: [entry], total: 1, page: 1, limit: 25 }),
            { headers: { 'content-type': 'application/json' } },
          ),
        ),
    })
  })
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

const renderOrders = (showDeletedOrders = false) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/cms/orders']}>
        <Routes>
          <Route
            path="/cms/orders"
            element={<Outlet context={{ ...context, showDeletedOrders }} />}>
            <Route index element={<Orders />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

describe('CMS order email history', () => {
  it.each([false, true])(
    'filters the shared order cache for deleted view %s',
    (showDeletedOrders) => {
      renderOrders(showDeletedOrders)
      expect(
        screen.getByRole('checkbox', {
          name: `Select order #${showDeletedOrders ? 4 : 1}`,
        }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('checkbox', {
          name: `Select order #${showDeletedOrders ? 1 : 4}`,
        }),
      ).not.toBeInTheDocument()
    },
  )

  it('fetches email history only when expanded, without opening the order editor', async () => {
    const user = userEvent.setup()
    renderOrders()
    expect(authRequest.get).not.toHaveBeenCalled()
    const button = screen.getByRole('button', {
      name: 'Show emails for order #1',
    })

    await user.click(button)
    const history = screen.getByRole('region', {
      name: 'Emails for payment pi_test',
    })

    expect(
      await within(history).findByText('receipt@example.com'),
    ).toBeInTheDocument()
    expect(
      within(history).getByText('Sent', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(authRequest.get).toHaveBeenCalledWith(
      'cms/email-outbox',
      expect.objectContaining({
        searchParams: { paymentId: 'pi_test', page: 1, limit: 25 },
      }),
    )
    expect(context.setIsDialogOpen).not.toHaveBeenCalled()
    expect(context.setSelectedItems).not.toHaveBeenCalled()
    expect(context.setEditedItem).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'Show emails for order #3' }),
    ).not.toBeInTheDocument()
    expect(
      within(history).queryByRole('option', { name: 'Verification' }),
    ).not.toBeInTheDocument()
    expect(
      within(history).queryByRole('option', { name: 'Password reset' }),
    ).not.toBeInTheDocument()
  })

  it('switches to another order without mixing similar payment IDs or history', async () => {
    const user = userEvent.setup()
    renderOrders()
    await user.click(
      screen.getByRole('button', { name: 'Show emails for order #1' }),
    )
    await screen.findByText('receipt@example.com')
    await user.click(
      screen.getByRole('button', { name: 'Show emails for order #2' }),
    )

    expect(
      await screen.findByText('other-receipt@example.com'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Emails for payment pi_test' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('receipt@example.com')).not.toBeInTheDocument()
    expect(authRequest.get).toHaveBeenLastCalledWith(
      'cms/email-outbox',
      expect.objectContaining({
        searchParams: { paymentId: 'pi_test_extra', page: 1, limit: 25 },
      }),
    )
  })

  it('refreshes the history on reopening and leaves order selection working', async () => {
    const user = userEvent.setup()
    renderOrders()
    await user.click(
      screen.getByRole('button', { name: 'Show emails for order #1' }),
    )
    await screen.findByText('receipt@example.com')
    await user.click(
      screen.getByRole('button', { name: 'Hide emails for order #1' }),
    )
    emailStatus = 'failed'
    await user.click(
      screen.getByRole('button', { name: 'Show emails for order #1' }),
    )
    const history = screen.getByRole('region', {
      name: 'Emails for payment pi_test',
    })

    await waitFor(() =>
      expect(
        within(history).getByText('Failed', { selector: 'span' }),
      ).toBeInTheDocument(),
    )
    expect(authRequest.get).toHaveBeenCalledTimes(2)
    await user.click(screen.getByRole('checkbox', { name: 'Select order #1' }))
    expect(context.setSelectedItems).toHaveBeenCalled()
    expect(context.setIsDialogOpen).not.toHaveBeenCalled()
  })
})
