import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { authRequest } from '@/api/authRequest'
import { baseRequest } from '@/api/baseRequest'
import type { Book, BookWithAuthorId } from '@/types'
import { authSessionChanged } from '../slices/user'
import { createAppStore } from '../store'
import { refreshCartItems } from '../thunks/cart'
import { fetchAuthTokens, logout } from '../thunks/user'
import { bookshopApi } from './bookshopApi'

const book: Book = {
  id: 7,
  title: 'Cached book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: '',
  description: 'A book',
  publishYear: 2024,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}

const httpResponse = (data: unknown) =>
  ky.get('https://bookshop.test/mock', {
    retry: 0,
    fetch: () =>
      Promise.resolve(
        new Response(JSON.stringify(data), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
  })

const cmsBook: BookWithAuthorId = { ...book, authorId: 1 }
let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
  vi.spyOn(baseRequest, 'get').mockImplementation(() => httpResponse(book))
  vi.spyOn(authRequest, 'get').mockImplementation(() => httpResponse([cmsBook]))
  vi.spyOn(authRequest, 'patch').mockImplementation(() => httpResponse(cmsBook))
})
afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('server-data cache', () => {
  it('deduplicates concurrent queries without a second entity slice', async () => {
    const a = store.dispatch(
      bookshopApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    const b = store.dispatch(
      bookshopApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    await Promise.all([a.unwrap(), b.unwrap()])
    expect(baseRequest.get).toHaveBeenCalledTimes(1)
    expect(store.getState().books).not.toHaveProperty('books')
    expect(bookshopApi.endpoints.book.select(7)(store.getState()).data).toEqual(
      book,
    )
  })

  it('refreshes public and CMS books after a CMS mutation', async () => {
    const publicQuery = store.dispatch(bookshopApi.endpoints.book.initiate(7))
    const cmsQuery = store.dispatch(bookshopApi.endpoints.cmsBooks.initiate())

    await Promise.all([publicQuery.unwrap(), cmsQuery.unwrap()])
    const changed = {
      ...book,
      title: 'Updated book',
      price: 12,
      discountPrice: 12,
    }

    vi.mocked(baseRequest.get).mockImplementation(() => httpResponse(changed))
    vi.mocked(authRequest.get).mockImplementation(() =>
      httpResponse([{ ...changed, authorId: 1 }]),
    )
    const mutation = store.dispatch(
      bookshopApi.endpoints.updateBook.initiate({
        id: 7,
        title: changed.title,
      }),
    )
    await mutation.unwrap()
    mutation.reset()
    await vi.waitFor(() => {
      expect(
        bookshopApi.endpoints.book.select(7)(store.getState()).data?.title,
      ).toBe(changed.title)
      expect(
        bookshopApi.endpoints.cmsBooks.select()(store.getState()).data?.[0]
          ?.title,
      ).toBe(changed.title)
    })
    expect(store.getState().bookshopApi.mutations).toEqual({})
    publicQuery.unsubscribe()
    cmsQuery.unsubscribe()
  })

  it('forces fresh prices for checkout recovery instead of replaying a cached book', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    await store
      .dispatch(bookshopApi.endpoints.book.initiate(7, { subscribe: false }))
      .unwrap()

    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)
    expect(
      bookshopApi.endpoints.book.select(7)(store.getState()).data?.price,
    ).toBe(10)

    vi.mocked(baseRequest.get).mockImplementation(() =>
      httpResponse({ ...book, price: 20 }),
    )
    expect(
      (
        await store
          .dispatch(refreshCartItems([{ id: 7, quantity: 1 }]))
          .unwrap()
      )[0]?.price,
    ).toBe(20)
    expect(baseRequest.get).toHaveBeenCalledTimes(2)
  })

  it('refreshes retained recommendations after a CMS book edit even with focus/reconnect refetch disabled', async () => {
    vi.mocked(baseRequest.get).mockImplementation(() => httpResponse([book]))
    const query = store.dispatch(
      bookshopApi.endpoints.booksByProperty.initiate('recommended', {
        subscriptionOptions: {
          refetchOnFocus: false,
          refetchOnReconnect: false,
        },
      }),
    )

    await query.unwrap()
    const changed = { ...book, title: 'Updated recommendation' }

    vi.mocked(baseRequest.get).mockImplementation(() => httpResponse([changed]))
    await store
      .dispatch(
        bookshopApi.endpoints.updateBook.initiate({
          id: changed.id,
          title: changed.title,
        }),
      )
      .unwrap()
    await vi.waitFor(() => {
      expect(
        bookshopApi.endpoints.booksByProperty.select('recommended')(
          store.getState(),
        ).data?.[0]?.title,
      ).toBe(changed.title)
    })
    expect(baseRequest.get).toHaveBeenCalledTimes(2)
    query.unsubscribe()
  })

  it('clears private queries when logout succeeds', async () => {
    await store.dispatch(
      bookshopApi.util.upsertQueryData('userOrders', undefined, []),
    )
    expect(
      bookshopApi.endpoints.userOrders.select()(store.getState()).isSuccess,
    ).toBe(true)
    vi.spyOn(usersApi, 'postUserLogout').mockResolvedValue({ success: true })
    await store.dispatch(logout()).unwrap()
    expect(
      bookshopApi.endpoints.userOrders.select()(store.getState())
        .isUninitialized,
    ).toBe(true)
  })

  it('clears private data when the refresh session expires', async () => {
    store.dispatch(authSessionChanged('old-token'))
    await store.dispatch(
      bookshopApi.util.upsertQueryData('userOrders', undefined, []),
    )
    vi.spyOn(usersApi, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: null,
    })
    await store.dispatch(fetchAuthTokens()).unwrap()
    expect(
      bookshopApi.endpoints.userOrders.select()(store.getState())
        .isUninitialized,
    ).toBe(true)
  })

  it('stores serializable failures rather than thrown provider objects', async () => {
    vi.mocked(baseRequest.get).mockRejectedValue(new Error('Book unavailable'))
    await store.dispatch(
      bookshopApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    expect(
      bookshopApi.endpoints.book.select(7)(store.getState()).error,
    ).toEqual({ code: 'UNKNOWN_API_ERROR', message: 'Book unavailable' })
  })
})
