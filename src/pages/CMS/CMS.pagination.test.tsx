import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { toast } from '@/components/AppToaster'
import {
  type Author,
  type BookWithAuthorId,
  type CmsOrder,
  type CmsUser,
  UserRole,
} from '@/types'
import { CMS } from './CMS'
import { Authors } from './components/Authors/Authors'
import { Books } from './components/Books/Books'
import { Orders } from './components/Orders/Orders'
import { Users } from './components/Users/Users'

const records = Array.from({ length: 21 }, (_, index) => ({
  id: index + 1,
  createdAt: new Date(Date.UTC(2026, 9, index + 1)).toISOString(),
}))
const orders: CmsOrder[] = records.map((record) => ({
  ...record,
  paymentId: `pi_order_${record.id}`,
  paymentStatus: 'succeeded',
  total: 10,
  currency: 'USD',
  items: [],
  firstName: 'Reader',
  lastName: String(record.id),
  email: 'reader@example.com',
  shipping: null,
  paidAt: record.createdAt,
  updatedAt: record.createdAt,
  deletedAt: null,
}))
orders[1] = { ...orders[1]!, createdAt: '2026-11-01T12:00:00Z' }
const users: CmsUser[] = records.map((record) => ({
  ...record,
  uuid: `user-${record.id}`,
  firstName: 'Reader',
  lastName: String(record.id),
  email: `reader${record.id}@example.com`,
  country: 'hu',
  role: UserRole.User,
  phone: null,
  address: null,
  avatar: null,
  verified: true,
  updatedAt: record.createdAt,
  deletedAt: null,
}))
const books: BookWithAuthorId[] = records.map((record) => ({
  ...record,
  title: `Book ${record.id}`,
  author: null,
  authorId: 1,
  genre: 'Fiction',
  imgUrl: '',
  description: '',
  publishYear: 2026,
  rating: 4,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}))
const authors: Author[] = records.map((record) => ({
  ...record,
  name: `Author ${record.id}`,
  fullName: '',
  birthYear: '',
  deathYear: '',
  homeland: '',
  biography: '',
}))
const responses: Record<string, unknown> = {
  'cms/orders': [
    ...orders,
    { ...orders[0]!, id: 99, deletedAt: '2026-11-02T12:00:00Z' },
  ],
  'cms/users': [
    ...users,
    { ...users[0]!, id: 99, deletedAt: '2026-11-02T12:00:00Z' },
  ],
  'cms/books': books,
  'cms/authors': authors,
}

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
  vi.spyOn(privateApi, 'authRequest').mockImplementation((url) => {
    if (typeof url !== 'string') {
      throw new TypeError('Expected a string API path in the CMS request mock')
    }

    return ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () => Promise.resolve(Response.json(responses[url] ?? [])),
    })
  })
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

const renderCMS = (tab: string) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/cms/' + tab]}>
        <Routes>
          <Route path="/cms" element={<CMS />}>
            <Route path="orders" element={<Orders />} />
            <Route path="books" element={<Books />} />
            <Route path="authors" element={<Authors />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

const visibleIds = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => Number(within(row).getAllByRole('cell')[1]!.textContent))

describe('CMS pagination', () => {
  it.each(['orders', 'books', 'authors', 'users'] as const)(
    'pages %s in groups of ten and keeps bulk selection on the visible page',
    async (tab) => {
      const user = userEvent.setup()
      renderCMS(tab)
      await screen.findByRole('table')

      expect(visibleIds()).toEqual(
        tab === 'orders'
          ? [2, 21, 20, 19, 18, 17, 16, 15, 14, 13]
          : records.slice(0, 10).map((record) => record.id),
      )
      await user.click(screen.getByRole('checkbox', { name: 'Select all' }))
      for (const checkbox of within(screen.getByRole('table')).getAllByRole(
        'checkbox',
      )) {
        expect(checkbox).toBeChecked()
      }

      const requestsBeforePaging = vi.mocked(privateApi.authRequest).mock.calls
        .length
      await user.click(screen.getByRole('button', { name: 'Next Page' }))

      expect(visibleIds()).toHaveLength(10)
      for (const checkbox of within(screen.getByRole('table')).getAllByRole(
        'checkbox',
      )) {
        expect(checkbox).not.toBeChecked()
      }
      await user.click(
        screen.getByRole('button', {
          name: tab === 'orders' || tab === 'users' ? 'Remove' : 'Delete',
        }),
      )
      expect(toast).toHaveBeenCalledWith(
        i18n.t('cms.noSelection'),
        expect.anything(),
      )

      await user.click(screen.getByRole('button', { name: 'Last Page' }))

      expect(visibleIds()).toEqual([tab === 'orders' ? 1 : 21])
      expect(screen.getByRole('button', { name: 'Next Page' })).toBeDisabled()
      expect(privateApi.authRequest).toHaveBeenCalledTimes(requestsBeforePaging)
    },
  )

  it.each(['orders', 'users'] as const)(
    'resets the %s page when switching to removed records',
    async (tab) => {
      const user = userEvent.setup()
      renderCMS(tab)
      await screen.findByRole('table')
      await user.click(screen.getByRole('button', { name: 'Next Page' }))
      await user.click(
        screen.getByRole('button', { name: `Show removed ${tab}` }),
      )

      expect(visibleIds()).toEqual([99])
      expect(store.getState().cms.currentPages[tab]).toBe(1)
      expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    },
  )

  it('keeps the ID header as ID in Hungarian', async () => {
    renderCMS('orders')
    await screen.findByRole('table')
    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Fizetési azonosító' }),
    ).toBeInTheDocument()
  })
})
