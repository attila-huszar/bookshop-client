import ky from 'ky'
import { vi } from 'vitest'
import { authRequest } from '@/api'
import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { authLoader } from './authLoader'
import { cmsLoader } from './cmsLoader'

vi.mock('@/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store')>()

  return { ...actual, store: actual.createAppStore() }
})

vi.mock('./authLoader', () => ({ authLoader: vi.fn() }))

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
})

describe('cmsLoader', () => {
  it.each(['orders', 'books', 'authors', 'users'] as const)(
    'waits for admin access before preloading %s without awaiting its data',
    async (tab) => {
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
      vi.spyOn(authRequest, 'get').mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () => response.then((value) => value.clone()),
        }),
      )

      const loading = cmsLoader(tab)

      expect(authLoader).toHaveBeenCalledWith({ adminRequired: true })
      expect(authRequest.get).not.toHaveBeenCalled()
      completeAuth(true)
      await expect(loading).resolves.toBeUndefined()
      expect(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()).length,
      ).toBeGreaterThan(0)

      completeRequest(new Response('[]'))
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(authRequest.get).toHaveBeenCalledTimes(tab === 'books' ? 2 : 1)

      await cmsLoader(tab)
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(authRequest.get).toHaveBeenCalledTimes(
        tab === 'authors' || tab === 'users' ? 1 : 2,
      )
    },
  )

  it('does not preload CMS data when admin access is denied', async () => {
    vi.mocked(authLoader).mockResolvedValue(false)
    const get = vi.spyOn(authRequest, 'get')

    await cmsLoader('orders')

    expect(get).not.toHaveBeenCalled()
  })
})
