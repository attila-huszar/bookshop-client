import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authRequest } from '@/api/authRequest'
import { bookshopApi } from './api/bookshopApi'
import {
  booksQueryArgs,
  booksSelector,
  cmsAuthorsSelector,
  cmsBooksSelector,
  cmsOrdersSelector,
  cmsUsersSelector,
  newsSelector,
  ordersSelector,
  userSelector,
} from './selectors'
import { authSessionChanged } from './slices/user'
import { createAppStore, type RootState } from './store'

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
})

describe('catalogue selector dependencies', () => {
  it('keeps its result stable when unrelated queries change', async () => {
    const result = booksSelector(store.getState())
    await store.dispatch(
      bookshopApi.util.upsertQueryData('userOrders', undefined, []),
    )

    expect(booksSelector(store.getState())).toBe(result)
  })

  it('updates the derived total when the current page query changes', async () => {
    const result = booksSelector(store.getState())
    await store.dispatch(
      bookshopApi.util.upsertQueryData(
        'books',
        booksQueryArgs(store.getState()),
        { books: [], total: 24 },
      ),
    )

    expect(booksSelector(store.getState()).booksTotal).toBe(24)
    expect(booksSelector(store.getState())).not.toBe(result)
    expect(store.getState().books).not.toHaveProperty('booksTotal')
  })
})

describe('initial query loading', () => {
  it('keeps a cached order result visible during a refresh and settles a failed request', async () => {
    await store.dispatch(
      bookshopApi.util.upsertQueryData('userOrders', undefined, []),
    )
    let failRequest!: (error: Error) => void
    const response = new Promise<Response>((_resolve, reject) => {
      failRequest = reject
    })
    vi.spyOn(authRequest, 'get').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => response,
      }),
    )
    const request = store.dispatch(
      bookshopApi.endpoints.userOrders.initiate(undefined, {
        subscribe: false,
        forceRefetch: true,
      }),
    )

    expect(ordersSelector(store.getState()).ordersIsLoading).toBe(false)

    failRequest(new Error('Network unavailable'))
    await request

    expect(ordersSelector(store.getState()).ordersIsLoading).toBe(false)
    expect(ordersSelector(store.getState()).ordersError).toEqual({
      code: 'UNKNOWN_API_ERROR',
    })
  })

  it.each([
    {
      endpoint: 'cmsAuthors',
      loading: (state: RootState) => cmsAuthorsSelector(state).authorsLoading,
    },
    {
      endpoint: 'cmsBooks',
      loading: (state: RootState) => cmsBooksSelector(state).booksLoading,
    },
    {
      endpoint: 'cmsOrders',
      loading: (state: RootState) => cmsOrdersSelector(state).ordersLoading,
    },
    {
      endpoint: 'cmsUsers',
      loading: (state: RootState) => cmsUsersSelector(state).usersLoading,
    },
    {
      endpoint: 'news',
      loading: (state: RootState) => newsSelector(state).newsIsLoading,
    },
    {
      endpoint: 'userOrders',
      loading: (state: RootState) => ordersSelector(state).ordersIsLoading,
    },
  ] as const)(
    'does not treat an unstarted $endpoint query as empty results',
    async ({ endpoint, loading }) => {
      expect(loading(store.getState())).toBe(true)

      await store.dispatch(
        bookshopApi.util.upsertQueryData(endpoint, undefined, []),
      )

      expect(loading(store.getState())).toBe(false)
    },
  )

  it('only marks a missing profile as loading when there is an authenticated session', () => {
    expect(userSelector(store.getState()).userIsLoading).toBe(false)

    store.dispatch(authSessionChanged('access-token'))

    expect(userSelector(store.getState()).userIsLoading).toBe(true)
  })
})
