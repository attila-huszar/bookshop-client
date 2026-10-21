import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { authRequest } from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { logout } from '@/store/thunks/user'
import type { EmailOutboxEntry } from '@/types'
import { CMS } from '../../CMS'
import { OrderEmails } from './OrderEmails'

const entry: EmailOutboxEntry = {
  id: 'order-confirmed-pi_test',
  type: 'orderConfirmation',
  recipient: 'reader@example.com',
  notificationType: null,
  failureReason: null,
  paymentId: 'pi_test',
  status: 'sent',
  queueAttempts: 1,
  deliveryAttempts: 1,
  createdAt: '2026-10-07T12:00:00Z',
  processedAt: '2026-10-07T12:00:01Z',
  deliveryUpdatedAt: '2026-10-07T12:00:02Z',
  nextAttemptAt: null,
  lastError: null,
}
const criteria = { paymentId: 'pi_test', page: 1, limit: 25 }
let store: ReturnType<typeof createAppStore>
let entries: EmailOutboxEntry[]
let total: number

beforeEach(() => {
  store = createAppStore()
  entries = [entry]
  total = 26
  vi.spyOn(authRequest, 'get').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify({ entries, total, ...criteria }), {
            headers: { 'content-type': 'application/json' },
          }),
        ),
    }),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const renderOutbox = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <OrderEmails paymentId="pi_test" />
      </MemoryRouter>
    </Provider>,
  )

describe('Order emails', () => {
  it('does not show a cached empty message while an email refresh is pending', async () => {
    entries = []
    total = 0
    renderOutbox()
    await screen.findByText('No emails for this order')

    let completeRequest!: (value: Response) => void
    const pending = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.mocked(authRequest.get).mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => pending,
      }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute(
        'aria-busy',
        'true',
      )
    })
    expect(screen.queryByText('Loading emails…')).not.toBeInTheDocument()
    expect(
      screen.queryByText('No emails for this order'),
    ).not.toBeInTheDocument()

    act(() => {
      completeRequest(
        new Response(
          JSON.stringify({ entries: [entry], total: 1, ...criteria }),
          {
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
    })

    expect(await screen.findByText('reader@example.com')).toBeInTheDocument()
  })

  it('debounces typing across renders and requires two trimmed characters', async () => {
    renderOutbox()
    await screen.findByText('reader@example.com')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const input = screen.getByLabelText('Recipient')

    fireEvent.change(input, { target: { value: ' r ' } })
    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(authRequest.get).toHaveBeenCalledTimes(1)

    fireEvent.change(input, { target: { value: 're' } })
    await act(() => vi.advanceTimersByTimeAsync(299))
    expect(authRequest.get).toHaveBeenCalledTimes(1)

    fireEvent.change(input, { target: { value: 'reader' } })
    await act(() => vi.advanceTimersByTimeAsync(299))
    expect(authRequest.get).toHaveBeenCalledTimes(1)

    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(authRequest.get).toHaveBeenCalledTimes(2)
    expect(authRequest.get).toHaveBeenLastCalledWith(
      'cms/email-outbox',
      expect.objectContaining({
        searchParams: { ...criteria, search: 'reader' },
      }),
    )
  })

  it('clears the filter and pending search, resets the page, and restores input focus', async () => {
    renderOutbox()
    await screen.findByText('reader@example.com')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const input = screen.getByLabelText('Recipient')

    fireEvent.change(input, { target: { value: 'reader' } })
    await act(() => vi.advanceTimersByTimeAsync(300))
    await act(() => vi.advanceTimersByTimeAsync(100))
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(authRequest.get).toHaveBeenLastCalledWith(
      'cms/email-outbox',
      expect.objectContaining({
        searchParams: { ...criteria, page: 2, search: 'reader' },
      }),
    )

    fireEvent.change(input, { target: { value: 'reader pending' } })
    fireEvent.click(
      screen.getByRole('button', { name: 'Clear recipient search' }),
    )
    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(screen.getByText('26 emails · Page 1 of 2')).toBeInTheDocument()
    expect(authRequest.get).toHaveBeenLastCalledWith(
      'cms/email-outbox',
      expect.objectContaining({ searchParams: criteria }),
    )
    expect(
      screen.queryByRole('button', { name: 'Clear recipient search' }),
    ).not.toBeInTheDocument()
  })

  it('shows reconciliation failure reasons separately from mail delivery errors', async () => {
    entries = [
      {
        ...entry,
        type: 'adminPaymentNotification',
        notificationType: 'error',
        failureReason: 'Stripe payment amount differs from the order',
        lastError: 'Email delivery failed',
      },
    ]
    renderOutbox()
    expect(await screen.findByText('Reconciliation failed')).toBeInTheDocument()
    expect(
      screen.getByText('Stripe payment amount differs from the order'),
    ).toBeInTheDocument()
    expect(screen.getByText('Email delivery failed')).toBeInTheDocument()
  })

  it('shows read-only summaries and loads filtered pages through the authenticated API', async () => {
    const user = userEvent.setup()
    renderOutbox()
    expect(await screen.findByText('reader@example.com')).toBeInTheDocument()
    expect(screen.getByText('Sent', { selector: 'span' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Updated At' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Queue processed' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Delivery updated' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /resend|delete|remove|add/i }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() =>
      expect(authRequest.get).toHaveBeenLastCalledWith(
        'cms/email-outbox',
        expect.objectContaining({ searchParams: { ...criteria, page: 2 } }),
      ),
    )
    await user.selectOptions(screen.getByLabelText('Status'), 'failed')
    await waitFor(() =>
      expect(authRequest.get).toHaveBeenLastCalledWith(
        'cms/email-outbox',
        expect.objectContaining({
          searchParams: { ...criteria, status: 'failed' },
        }),
      ),
    )
    await user.selectOptions(
      screen.getByLabelText('Email type'),
      'orderConfirmation',
    )
    await user.type(screen.getByLabelText('Recipient'), 'reader@example.com')
    await waitFor(() =>
      expect(authRequest.get).toHaveBeenLastCalledWith(
        'cms/email-outbox',
        expect.objectContaining({
          searchParams: {
            ...criteria,
            status: 'failed',
            type: 'orderConfirmation',
            search: 'reader@example.com',
          },
        }),
      ),
    )
  })

  it('refreshes delivery results and hides stale rows when filters change', async () => {
    const user = userEvent.setup()
    renderOutbox()
    await screen.findByText('reader@example.com')
    entries = [
      { ...entry, status: 'failed', lastError: 'Email delivery failed' },
    ]
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(await screen.findByText('Email delivery failed')).toBeInTheDocument()
    expect(screen.getByText('Failed', { selector: 'span' })).toBeInTheDocument()
    entries = []
    total = 0
    await user.selectOptions(screen.getByLabelText('Status'), 'skipped')
    expect(
      await screen.findByText('No emails for this order'),
    ).toBeInTheDocument()
    expect(screen.queryByText('reader@example.com')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('keeps refresh available after a request fails', async () => {
    const user = userEvent.setup()
    vi.mocked(authRequest.get).mockRejectedValueOnce(
      new Error('Network unavailable'),
    )
    renderOutbox()
    expect(
      await screen.findByText('Could not load order emails. Try refreshing.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(await screen.findByText('reader@example.com')).toBeInTheDocument()
  })

  it('clears cached outbox data on a session transition', async () => {
    const query = store.dispatch(
      bookshopApi.endpoints.cmsEmailOutbox.initiate(criteria),
    )

    await query.unwrap()
    expect(
      bookshopApi.endpoints.cmsEmailOutbox.select(criteria)(store.getState())
        .data?.entries,
    ).toEqual([entry])
    vi.spyOn(usersApi, 'postUserLogout').mockResolvedValue({ success: true })
    await store.dispatch(logout()).unwrap()
    expect(
      bookshopApi.endpoints.cmsEmailOutbox.select(criteria)(store.getState())
        .isUninitialized,
    ).toBe(true)
    query.unsubscribe()
  })

  it('keeps only the existing CMS tabs and keeps order Add disabled', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/cms/orders']}>
          <CMS />
        </MemoryRouter>
      </Provider>,
    )
    expect(
      screen.queryByRole('link', { name: 'Email outbox' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })
})
