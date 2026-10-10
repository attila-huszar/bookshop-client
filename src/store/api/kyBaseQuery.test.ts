import { createElement } from 'react'
import { Provider, useSelector } from 'react-redux'
import { act, render, waitFor } from '@testing-library/react'
import { HTTPError } from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authRequest, configureAuthRequest } from '@/api/authRequest'
import { baseRequest } from '@/api/baseRequest'
import { uploadProductImage } from '@/api/cms'
import {
  deletePaymentIntent,
  getPaymentIntent,
  postPaymentIntent,
} from '@/api/payments'
import { postUserLogout, retrieveAuthTokens } from '@/api/users'
import { authSessionChanged } from '../slices/user'
import { store as appStore, createAppStore, type RootState } from '../store'
import { expireAuthSession, fetchAuthTokens } from '../thunks/user'
import { bookshopApi, useUserProfileQuery } from './bookshopApi'

const jsonResponse = (
  data: unknown,
  status = 200,
  headers?: Record<string, string>,
) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
const requestOf = (input: RequestInfo | URL): Request =>
  input instanceof Request ? input : new Request(input)

let store: ReturnType<typeof createAppStore>
let accessToken: string | null
let refresh: ReturnType<
  typeof vi.fn<() => Promise<{ accessToken: string | null }>>
>
let expire: ReturnType<typeof vi.fn<(accessToken: string) => void>>
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>
let capturedRequests: Request[]

beforeEach(() => {
  store = createAppStore()
  accessToken = 'old-token'
  refresh = vi
    .fn<() => Promise<{ accessToken: string | null }>>()
    .mockImplementation(() => Promise.resolve({ accessToken }))
  expire = vi.fn((rejectedToken: string) => {
    if (accessToken === rejectedToken) {
      accessToken = null
    }
  })
  configureAuthRequest({ getAccessToken: () => accessToken, refresh, expire })
  fetchMock = vi
    .fn<typeof fetch>()
    .mockImplementation(() => Promise.resolve(jsonResponse([])))
  capturedRequests = []
  const mockFetch: typeof fetch = (input, options) => {
    capturedRequests.push(requestOf(input).clone())

    return fetchMock(input, options)
  }

  vi.stubGlobal('fetch', mockFetch)

  // Use real Ky/hooks with an absolute test URL; no network/provider calls.
  const publicClient = baseRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })
  const privateClient = authRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })

  vi.spyOn(baseRequest, 'get').mockImplementation(publicClient.get)
  vi.spyOn(baseRequest, 'post').mockImplementation(publicClient.post)
  vi.spyOn(authRequest, 'get').mockImplementation(privateClient.get)
  vi.spyOn(authRequest, 'post').mockImplementation(privateClient.post)
  vi.spyOn(authRequest, 'patch').mockImplementation(privateClient.patch)
  vi.spyOn(authRequest, 'delete').mockImplementation(privateClient.delete)
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  configureAuthRequest({
    getAccessToken: () => appStore.getState().user.accessToken,
    refresh: () => appStore.dispatch(fetchAuthTokens()).unwrap(),
    expire: (rejectedToken) =>
      appStore.dispatch(expireAuthSession(rejectedToken)),
  })
})

describe('Ky-backed RTK Query transport', () => {
  it.each(['expired-token', null])(
    'logs out with cookies and no token refresh for session %s',
    async (token) => {
      accessToken = token
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }))

      expect(await postUserLogout()).toEqual({ success: true })
      expect(capturedRequests[0]?.method).toBe('POST')
      expect(new URL(capturedRequests[0]!.url).pathname).toBe(
        '/api/users/logout',
      )
      expect(capturedRequests[0]?.credentials).toBe('include')
      expect(capturedRequests[0]?.headers.has('Authorization')).toBe(false)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(refresh).not.toHaveBeenCalled()
      expect(expire).not.toHaveBeenCalled()
    },
  )

  it('keeps public queries anonymous and maps pagination headers and filters', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([], 200, { 'x-total-count': '42' }),
    )
    const result = await store
      .dispatch(
        bookshopApi.endpoints.books.initiate(
          {
            currentPage: 2,
            itemsPerPage: 10,
            criteria: {
              genre: ['Science & nature', 'Fiction'],
              priceMin: 0,
              priceMax: 20,
              discount: 'discountOnly',
              publishYearMin: 2000,
              publishYearMax: 2025,
              rating: 3.5,
            },
          },
          { subscribe: false },
        ),
      )
      .unwrap()

    expect(result).toEqual({ books: [], total: 42 })
    const request = requestOf(fetchMock.mock.calls[0]![0])
    const params = new URL(request.url).searchParams

    expect(params.getAll('genre')).toEqual(['Science & nature', 'Fiction'])
    expect(Object.fromEntries(params)).toMatchObject({
      page: '2',
      limit: '10',
      discountPrice_gte: '0',
      discountPrice_lte: '20',
      discount_gte: '1',
      publishYear_gte: '2000',
      publishYear_lte: '2025',
      rating_gte: '3.5',
    })
    expect(request.headers.has('authorization')).toBe(false)
    expect(request.headers.get('ngrok-skip-browser-warning')).toBe('true')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('encodes search text as a query value rather than extra parameters', async () => {
    await store
      .dispatch(
        bookshopApi.endpoints.bookSearch.initiate('A & B?genre=Fake', {
          subscribe: false,
        }),
      )
      .unwrap()
    const params = new URL(requestOf(fetchMock.mock.calls[0]![0]).url)
      .searchParams

    expect(params.get('title')).toBe('A & B?genre=Fake')
    expect(params.has('genre')).toBe(false)
  })

  it('sends authenticated CMS mutation methods and JSON bodies', async () => {
    await store
      .dispatch(
        bookshopApi.endpoints.updateBook.initiate({ id: 7, title: 'Updated' }),
      )
      .unwrap()
    await store
      .dispatch(bookshopApi.endpoints.hardDeleteBooks.initiate([7]))
      .unwrap()
    const patch = capturedRequests[0]!
    const remove = capturedRequests[1]!

    expect(patch.method).toBe('PATCH')
    expect(patch.headers.get('authorization')).toBe('Bearer old-token')
    expect(await patch.json()).toEqual({ id: 7, title: 'Updated' })
    expect(remove.method).toBe('DELETE')
    expect(await remove.json()).toEqual({ bookIds: [7] })
  })

  it('shares one refresh across concurrent 401s and preserves cookie-enabled refresh', async () => {
    let releaseRefresh!: () => void
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })

    refresh.mockImplementation(async () => {
      await refreshGate
      const result = await retrieveAuthTokens()

      accessToken = result.accessToken

      return result
    })
    fetchMock.mockImplementation((input) => {
      const request = requestOf(input)

      if (request.url.endsWith('/users/refresh')) {
        return Promise.resolve(jsonResponse({ accessToken: 'new-token' }))
      }

      return Promise.resolve(
        jsonResponse(
          [],
          request.headers.get('authorization') === 'Bearer new-token'
            ? 200
            : 401,
        ),
      )
    })
    const orders = store.dispatch(
      bookshopApi.endpoints.userOrders.initiate(undefined, {
        subscribe: false,
      }),
    )
    const cms = store.dispatch(
      bookshopApi.endpoints.cmsBooks.initiate(undefined, { subscribe: false }),
    )

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
    expect(refresh).toHaveBeenCalledTimes(1)
    releaseRefresh()
    await Promise.all([orders.unwrap(), cms.unwrap()])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(5)
    const refreshRequest = capturedRequests.find((request) =>
      request.url.endsWith('/users/refresh'),
    )

    expect(refreshRequest?.credentials).toBe('include')
    expect(refreshRequest?.headers.has('authorization')).toBe(false)
  })

  it('expires the session without looping when the refreshed token is also rejected', async () => {
    refresh.mockImplementation(() => {
      accessToken = 'new-token'

      return Promise.resolve({ accessToken })
    })
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ error: 'Unauthorized' }, 401)),
    )
    const result = await store.dispatch(
      bookshopApi.endpoints.userOrders.initiate(undefined, {
        subscribe: false,
      }),
    )

    expect(result.error).toMatchObject({ status: 401 })
    expect(result.error).toHaveProperty('message', expect.any(String))
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(expire).toHaveBeenCalledExactlyOnceWith('new-token')
    expect(accessToken).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(JSON.stringify(result.error))).toEqual(result.error)
  })

  it('returns a serializable refresh failure without retrying the request', async () => {
    refresh.mockRejectedValue(new Error('Session expired'))
    fetchMock.mockResolvedValueOnce(jsonResponse([], 401))
    const result = await store.dispatch(
      bookshopApi.endpoints.userOrders.initiate(undefined, {
        subscribe: false,
      }),
    )

    expect(result.error).toEqual({ message: 'Session expired' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    { reason: 'the account no longer exists', refreshedAccessToken: null },
    {
      reason: 'the refreshed token is rejected',
      refreshedAccessToken: 'new-token',
    },
  ])(
    'stops subscribed profile requests and clears private data when $reason',
    async ({ refreshedAccessToken }) => {
      store.dispatch(authSessionChanged('old-token'))
      await store.dispatch(
        bookshopApi.util.upsertQueryData('userOrders', undefined, []),
      )
      configureAuthRequest({
        getAccessToken: () => store.getState().user.accessToken,
        refresh: () => store.dispatch(fetchAuthTokens()).unwrap(),
        expire: (rejectedToken) =>
          store.dispatch(expireAuthSession(rejectedToken)),
      })
      fetchMock.mockImplementation((input) => {
        const path = new URL(requestOf(input).url).pathname

        return Promise.resolve(
          path.endsWith('/users/refresh')
            ? jsonResponse({ accessToken: refreshedAccessToken })
            : jsonResponse({ error: 'Session unavailable' }, 401),
        )
      })

      function ProfileSubscription() {
        const sessionToken = useSelector(
          (state: RootState) => state.user.accessToken,
        )
        useUserProfileQuery({ skip: !sessionToken })

        return null
      }

      const view = render(
        createElement(Provider, {
          store,
          children: createElement(ProfileSubscription),
        }),
      )

      await waitFor(() => {
        expect(store.getState().user.accessToken).toBeNull()
        expect(
          bookshopApi.endpoints.userOrders.select()(store.getState())
            .isUninitialized,
        ).toBe(true)
      })
      await act(async () => {
        store.dispatch(bookshopApi.internalActions.onFocus())
        store.dispatch(bookshopApi.internalActions.onOnline())

        await Promise.resolve()
      })

      expect(
        capturedRequests.map((request) => new URL(request.url).pathname),
      ).toEqual([
        '/api/users/profile',
        '/api/users/refresh',
        ...(refreshedAccessToken ? ['/api/users/profile'] : []),
      ])
      expect(capturedRequests[1]?.credentials).toBe('include')
      view.unmount()
    },
  )

  it('forwards aborts to the actual Ky request', async () => {
    let requestSignal: AbortSignal | undefined

    fetchMock.mockImplementation((input) => {
      requestSignal = requestOf(input).signal

      return new Promise<Response>((_resolve, reject) => {
        requestSignal!.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        )
      })
    })
    const query = store.dispatch(
      bookshopApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    query.abort()
    await query
    expect(requestSignal?.aborted).toBe(true)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('handles successful no-content responses without trying to parse JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    const result = await store
      .dispatch(bookshopApi.endpoints.hardDeleteBooks.initiate([7]))
      .unwrap()

    expect(result).toBeNull()
  })

  it('returns malformed JSON and network failures as query errors', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('not json', {
        headers: { 'content-type': 'application/json' },
      }),
    )
    const malformed = await store.dispatch(
      bookshopApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    expect(malformed.error).toHaveProperty('message', expect.any(String))
    fetchMock.mockRejectedValueOnce(new Error('Offline'))
    const offline = await store.dispatch(
      bookshopApi.endpoints.book.initiate(8, { subscribe: false }),
    )

    expect(offline.error).toHaveProperty('message', expect.any(String))
  })
})

describe('direct Ky workflows', () => {
  it('clears the session and private cache when checkout rejects the refreshed token', async () => {
    store.dispatch(authSessionChanged('old-token'))
    await store.dispatch(
      bookshopApi.util.upsertQueryData('userOrders', undefined, []),
    )
    configureAuthRequest({
      getAccessToken: () => store.getState().user.accessToken,
      refresh: () => store.dispatch(fetchAuthTokens()).unwrap(),
      expire: (rejectedToken) =>
        store.dispatch(expireAuthSession(rejectedToken)),
    })
    fetchMock.mockImplementation((input) => {
      const path = new URL(requestOf(input).url).pathname

      return Promise.resolve(
        path.endsWith('/users/refresh')
          ? jsonResponse({ accessToken: 'new-token' })
          : jsonResponse({ error: 'Unauthorized' }, 401),
      )
    })
    const payment = { items: [{ id: 7, quantity: 1 }], expectedTotal: 1000 }

    await expect(
      postPaymentIntent(payment, 'same-attempt'),
    ).rejects.toBeInstanceOf(HTTPError)

    expect(store.getState().user.accessToken).toBeNull()
    expect(
      bookshopApi.endpoints.userOrders.select()(store.getState())
        .isUninitialized,
    ).toBe(true)
    expect(capturedRequests).toHaveLength(3)
    expect(capturedRequests[1]!.url).toBe(
      'https://bookshop.test/api/users/refresh',
    )

    for (const request of [capturedRequests[0]!, capturedRequests[2]!]) {
      expect(request.credentials).toBe('include')
      expect(request.headers.get('Idempotency-Key')).toBe('same-attempt')
      expect(await request.json()).toEqual(payment)
    }

    expect(capturedRequests[2]!.headers.get('authorization')).toBe(
      'Bearer new-token',
    )
  })

  it.each(['initial', 'retry', 'guest'])(
    'preserves a newer login when an older %s request returns 401',
    async (stage) => {
      accessToken = stage === 'guest' ? null : 'old-token'
      let respond!: (response: Response) => void
      const responseGate = new Promise<Response>((resolve) => {
        respond = resolve
      })

      refresh.mockImplementation(() => {
        accessToken = 'refreshed-token'

        return Promise.resolve({ accessToken })
      })
      fetchMock.mockImplementation(() => {
        if (stage === 'retry' && capturedRequests.length === 1) {
          return Promise.resolve(jsonResponse({}, 401))
        }

        return responseGate
      })
      const pending = postPaymentIntent(
        { items: [{ id: 7, quantity: 1 }], expectedTotal: 1000 },
        'same-attempt',
      ).catch((error: unknown) => error)

      await vi.waitFor(() => {
        expect(capturedRequests).toHaveLength(stage === 'retry' ? 2 : 1)
      })
      accessToken = 'new-login-token'
      respond(jsonResponse({}, 401))
      expect(await pending).toBeInstanceOf(HTTPError)

      expect(accessToken).toBe('new-login-token')
      expect(expire).not.toHaveBeenCalled()
      expect(refresh).toHaveBeenCalledTimes(stage === 'retry' ? 1 : 0)
      expect(capturedRequests).toHaveLength(stage === 'retry' ? 2 : 1)
    },
  )

  it('preserves checkout JSON, cookies, and idempotency headers through a token refresh', async () => {
    refresh.mockImplementation(() => {
      accessToken = 'new-token'

      return Promise.resolve({ accessToken })
    })
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        jsonResponse({
          paymentId: 'pi_retry',
          paymentToken: 'token',
          amount: 1000,
        }),
      )
    const payment = { items: [{ id: 7, quantity: 1 }], expectedTotal: 1000 }

    await postPaymentIntent(payment, 'same-attempt')
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(capturedRequests).toHaveLength(2)

    for (const request of capturedRequests) {
      expect(request.credentials).toBe('include')
      expect(request.headers.get('Idempotency-Key')).toBe('same-attempt')
      expect(await request.json()).toEqual(payment)
    }

    expect(capturedRequests[1]!.headers.get('authorization')).toBe(
      'Bearer new-token',
    )
  })

  it('preserves guest credentials and the same idempotency key on identical checkout retries', async () => {
    accessToken = null
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          paymentId: 'pi_guest',
          paymentToken: 'token',
          amount: 1000,
        }),
      ),
    )
    const payment = { items: [{ id: 7, quantity: 1 }], expectedTotal: 1000 }

    await postPaymentIntent(payment, 'same-attempt')
    await postPaymentIntent(payment, 'same-attempt')
    await getPaymentIntent('pi_guest')
    await deletePaymentIntent('pi_guest')
    const requests = capturedRequests

    expect(requests.map((request) => request.credentials)).toEqual([
      'include',
      'include',
      'include',
      'include',
    ])
    expect(requests.map((request) => request.method)).toEqual([
      'POST',
      'POST',
      'GET',
      'DELETE',
    ])

    for (const request of requests.slice(0, 2)) {
      expect(request.headers.get('Idempotency-Key')).toBe('same-attempt')
      expect(await request.json()).toEqual(payment)
    }

    expect(
      requests.every((request) => !request.headers.has('authorization')),
    ).toBe(true)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('uploads multipart data and relies on Ky to throw for unsuccessful responses', async () => {
    const form = new FormData()

    form.append(
      'image',
      new Blob(['image'], { type: 'image/png' }),
      'cover.png',
    )
    fetchMock.mockResolvedValueOnce(jsonResponse({ url: '/cover.png' }))
    expect(await uploadProductImage(form)).toEqual({ url: '/cover.png' })
    const request = requestOf(fetchMock.mock.calls[0]![0])

    expect(request.headers.get('content-type')).toMatch(
      /^multipart\/form-data; boundary=/,
    )
    expect(request.headers.get('authorization')).toBe('Bearer old-token')
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: 'Invalid upload' }, 400),
    )
    await expect(uploadProductImage(form)).rejects.toBeInstanceOf(HTTPError)
  })
})
