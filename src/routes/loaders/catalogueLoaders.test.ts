import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { store } from '@/store/store'
import { landingPageLoader } from './landingPageLoader'
import { productLoader } from './productLoader'
import { shopLoader } from './shopLoader'

vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/store')>()

  return { ...actual, store: actual.createAppStore() }
})

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-11T12:00:00Z'))
  vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () => Promise.resolve(new Response('[]')),
    }),
  )
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('catalogue loader freshness', () => {
  it.each([
    {
      name: 'book',
      load: () =>
        productLoader({
          request: new Request('https://bookshop.test/book?id=1'),
        }),
      age: cacheTimes.catalogue,
      initialRequests: 1,
      staleRequests: 1,
      result: 1,
    },
    {
      name: 'shop',
      load: shopLoader,
      age: cacheTimes.catalogue,
      initialRequests: 2,
      staleRequests: 1,
    },
    {
      name: 'home',
      load: landingPageLoader,
      age: cacheTimes.featured,
      initialRequests: 4,
      staleRequests: 4,
    },
  ])(
    'reuses fresh $name data and starts stale refreshes before rendering',
    async ({ load, age, initialRequests, staleRequests, result }) => {
      expect(load()).toBe(result)
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(publicApi.baseRequest).toHaveBeenCalledTimes(initialRequests)

      load()
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(publicApi.baseRequest).toHaveBeenCalledTimes(initialRequests)

      vi.setSystemTime(new Date(Date.now() + (age + 1) * 1000))
      expect(load()).toBe(result)
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(publicApi.baseRequest).toHaveBeenCalledTimes(
        initialRequests + staleRequests,
      )
    },
  )
})
