import ky from 'ky'
import { vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { store } from '@/store/store'
import { authLoader } from './authLoader'
import { cmsLoader } from './cmsLoader'

vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/store')>()

  return { ...actual, store: actual.createAppStore() }
})

vi.mock('./authLoader', () => ({ authLoader: vi.fn() }))

const request = () => new Request('https://bookshop.test/cms')

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
      vi.spyOn(privateApi, 'authRequest').mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () => response.then((value) => value.clone()),
        }),
      )

      const loading = cmsLoader(tab, request())

      expect(authLoader).toHaveBeenCalledWith({ adminRequired: true })
      expect(privateApi.authRequest).not.toHaveBeenCalled()
      completeAuth(true)
      await expect(loading).resolves.toBeUndefined()
      expect(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()).length,
      ).toBeGreaterThan(0)

      completeRequest(new Response('[]'))
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(privateApi.authRequest).toHaveBeenCalledTimes(
        tab === 'books' ? 2 : 1,
      )

      await cmsLoader(tab, request())
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
      expect(privateApi.authRequest).toHaveBeenCalledTimes(
        tab === 'authors' || tab === 'users' ? 1 : 2,
      )
    },
  )

  it('does not preload CMS data when admin access is denied', async () => {
    vi.mocked(authLoader).mockResolvedValue(false)
    const get = vi.spyOn(privateApi, 'authRequest')

    await cmsLoader('orders', request())

    expect(get).not.toHaveBeenCalled()
  })

  it('does not start CMS requests after navigation is cancelled during auth', async () => {
    let finishAuth!: (allowed: boolean) => void
    vi.mocked(authLoader).mockReturnValue(
      new Promise((resolve) => {
        finishAuth = resolve
      }),
    )
    const controller = new AbortController()
    const get = vi.spyOn(privateApi, 'authRequest')
    const loading = cmsLoader(
      'books',
      new Request('https://bookshop.test/cms/books', {
        signal: controller.signal,
      }),
    )

    controller.abort()
    finishAuth(true)

    await expect(loading).rejects.toMatchObject({ name: 'AbortError' })
    expect(get).not.toHaveBeenCalled()
  })
})
