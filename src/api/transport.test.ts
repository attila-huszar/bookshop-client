import { HTTPError } from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { ordersApi } from '@/store/api/ordersApi'
import { paymentsApi } from '@/store/api/paymentsApi'
import { authSessionChanged } from '@/store/slices/user'
import { store as appStore, createAppStore } from '@/store/store'
import { expireAuthSession, fetchAuthTokens } from '@/store/thunks/user'
import { log } from '@/services/logger'
import type { PaymentIntentRequest } from '@/types'
import * as privateApi from './authRequest'
import * as publicApi from './baseRequest'
import { uploadProductImage } from './cms'
import { LogLevel, sendLog } from './logs'
import { transport } from './transport'
import {
  postPasswordReset,
  postPasswordResetSubmit,
  postUserLogout,
  postVerifyEmail,
  postVerifyPasswordReset,
  retrieveAuthTokens,
} from './users'

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
  privateApi.configureAuthRequest({
    getAccessToken: () => accessToken,
    refresh,
    expire,
  })
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
  const publicClient = publicApi.baseRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })
  const privateClient = privateApi.authRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })

  Object.assign(
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(publicClient),
    publicClient,
  )
  Object.assign(
    vi.spyOn(privateApi, 'authRequest').mockImplementation(privateClient),
    privateClient,
  )
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  privateApi.configureAuthRequest({
    getAccessToken: () => appStore.getState().user.accessToken,
    refresh: () => appStore.dispatch(fetchAuthTokens()).unwrap(),
    expire: (rejectedToken) =>
      appStore.dispatch(expireAuthSession(rejectedToken)),
  })
})

describe.each([
  {
    name: 'email verification',
    verify: postVerifyEmail,
    path: '/api/users/verification',
    responseBody: { email: 'reader@example.com' },
    secondResponseBody: { email: 'second@example.com' },
  },
  {
    name: 'reset-token verification',
    verify: postVerifyPasswordReset,
    path: '/api/users/password-reset-token',
    responseBody: { token: 'shared-token' },
    secondResponseBody: { token: 'second-token' },
  },
])('$name requests', ({ verify, path, responseBody, secondResponseBody }) => {
  it('shares one anonymous POST for concurrent callers with the same token', async () => {
    let complete!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      complete = resolve
    })
    fetchMock.mockReturnValue(response)
    const first = verify('shared-token')
    const second = verify('shared-token')

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    complete(jsonResponse(responseBody))

    expect(await Promise.all([first, second])).toEqual([
      responseBody,
      responseBody,
    ])
    expect(capturedRequests[0]?.method).toBe('POST')
    expect(new URL(capturedRequests[0]!.url).pathname).toBe(path)
    expect(await capturedRequests[0]!.json()).toEqual({ token: 'shared-token' })
    expect(capturedRequests[0]?.headers.has('authorization')).toBe(false)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('keeps different verification tokens independent', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(responseBody))
      .mockResolvedValueOnce(jsonResponse(secondResponseBody))

    expect(
      await Promise.all([verify('shared-token'), verify('second-token')]),
    ).toEqual([responseBody, secondResponseBody])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each(['success', 'failure'] as const)(
    'removes a pending request after %s so later calls revalidate',
    async (outcome) => {
      fetchMock.mockResolvedValueOnce(
        outcome === 'success'
          ? jsonResponse(responseBody)
          : jsonResponse({ code: 'INVALID_TOKEN' }, 400),
      )
      const results = await Promise.allSettled([
        verify('shared-token'),
        verify('shared-token'),
      ])

      expect(results.map((result) => result.status)).toEqual(
        outcome === 'success'
          ? ['fulfilled', 'fulfilled']
          : ['rejected', 'rejected'],
      )
      expect(fetchMock).toHaveBeenCalledTimes(1)

      fetchMock.mockResolvedValueOnce(
        jsonResponse({ code: 'INVALID_TOKEN' }, 400),
      )
      await expect(verify('shared-token')).rejects.toBeInstanceOf(HTTPError)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    },
  )
})

describe('authentication transport', () => {
  it('keeps email verification and reset-token previews independent for the same token', async () => {
    fetchMock.mockImplementation((input) =>
      Promise.resolve(
        jsonResponse(
          requestOf(input).url.endsWith('/users/verification')
            ? { email: 'reader@example.com' }
            : { token: 'shared-token' },
        ),
      ),
    )

    expect(
      await Promise.all([
        postVerifyEmail('shared-token'),
        postVerifyPasswordReset('shared-token'),
      ]),
    ).toEqual([{ email: 'reader@example.com' }, { token: 'shared-token' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

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
    const orders = privateApi.authRequest.get('orders')
    const cms = privateApi.authRequest.get('cms/books')

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
    expect(refresh).toHaveBeenCalledTimes(1)
    releaseRefresh()
    await Promise.all([orders, cms])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(5)
    const refreshRequest = capturedRequests.find((request) =>
      request.url.endsWith('/users/refresh'),
    )

    expect(refreshRequest?.credentials).toBe('include')
    expect(refreshRequest?.headers.has('authorization')).toBe(false)
    expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
  })

  it('expires the session without looping when the refreshed token is also rejected', async () => {
    refresh.mockImplementation(() => {
      accessToken = 'new-token'

      return Promise.resolve({ accessToken })
    })
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ error: 'Unauthorized' }, 401)),
    )
    const result = await privateApi.authRequest
      .get('orders')
      .catch((error: unknown) => error)

    expect(result).toBeInstanceOf(HTTPError)
    expect(result).toHaveProperty('response.status', 401)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(expire).toHaveBeenCalledExactlyOnceWith('new-token')
    expect(accessToken).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
  })
})

describe('password reset responses', () => {
  it.each([
    {
      name: 'request',
      send: () => postPasswordReset('reader@example.com'),
      path: '/api/users/password-reset-request',
      body: { email: 'reader@example.com' },
    },
    {
      name: 'submit',
      send: () => postPasswordResetSubmit('reset-token', 'NewPass123!'),
      path: '/api/users/password-reset-submit',
      body: { token: 'reset-token', password: 'NewPass123!' },
    },
  ])(
    'accepts the $name success response without message text',
    async ({ send, path, body }) => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }))

      await expect(send()).resolves.toEqual({ success: true })

      const request = capturedRequests[0]!
      expect(new URL(request.url).pathname).toBe(path)
      expect(request.method).toBe('POST')
      expect(await request.json()).toEqual(body)
      expect(request.headers.has('authorization')).toBe(false)
      expect(refresh).not.toHaveBeenCalled()
    },
  )
})

describe('request failure logging', () => {
  it.each([400, 401, 403, 404, 409, 413, 429])(
    'rejects HTTP %s failures without logging or uploading warnings',
    async (status) => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ code: 'BAD_REQUEST' }, status),
      )

      await expect(
        publicApi.baseRequest.get('books', {
          searchParams: { title: 'Search text' },
        }),
      ).rejects.toBeInstanceOf(HTTPError)

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
    },
  )

  it('logs only the final failure after retries finish', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ code: 'INTERNAL_ERROR' }, 503)),
    )

    await expect(
      publicApi.baseRequest.get('books', {
        searchParams: { token: 'private-token' },
        retry: { limit: 2, delay: () => 0 },
      }),
    ).rejects.toBeInstanceOf(HTTPError)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(vi.spyOn(log, 'error')).toHaveBeenCalledExactlyOnceWith(
      'Request failed',
      {
        method: 'GET',
        path: '/api/books',
        status: 503,
        error: { code: 'INTERNAL_ERROR' },
      },
    )
  })

  it('does not log a failure recovered by a retry', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse([]))

    await publicApi.baseRequest.get('books', {
      retry: { limit: 1, delay: () => 0 },
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
  })

  it('logs a network failure once without replacing its original cause', async () => {
    const cause = new TypeError('Failed to fetch')
    fetchMock.mockRejectedValueOnce(cause)

    await expect(publicApi.baseRequest.get('books')).rejects.toHaveProperty(
      'cause',
      cause,
    )

    expect(vi.spyOn(log, 'error')).toHaveBeenCalledExactlyOnceWith(
      'Request failed',
      {
        method: 'GET',
        path: '/api/books',
        name: 'NetworkError',
      },
    )
  })

  it('does not report failed log uploads as another request failure', async () => {
    const loggingClient = transport.extend({
      prefix: 'https://bookshop.test/api',
      retry: 0,
    })
    vi.spyOn(transport, 'post').mockImplementation(loggingClient.post)
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 400))

    sendLog(LogLevel.Error, 'Request failed')

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    await expect(
      vi.mocked(transport.post).mock.results[0]!.value,
    ).rejects.toBeInstanceOf(HTTPError)
    expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
  })
})

function postPaymentIntent(
  payment: PaymentIntentRequest,
  clientIdempotencyKey: string,
) {
  return store
    .dispatch(
      paymentsApi.endpoints.createPayment.initiate({
        payment,
        clientIdempotencyKey,
      }),
    )
    .unwrap()
}

describe('Ky transport through payment endpoints', () => {
  it('clears the session and private cache when checkout rejects the refreshed token', async () => {
    store.dispatch(authSessionChanged('old-token'))
    await store.dispatch(
      ordersApi.util.upsertQueryData('userOrders', undefined, []),
    )
    privateApi.configureAuthRequest({
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
    ).rejects.toMatchObject({ name: 'AbortError' })

    expect(store.getState().user.accessToken).toBeNull()
    expect(
      ordersApi.endpoints.userOrders.select()(store.getState()).isUninitialized,
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
      expect(await pending).toMatchObject({ status: 401 })

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

  it('aborts payment retrieval with its caller without refreshing or expiring the session', async () => {
    let fetchSignal: AbortSignal | undefined
    fetchMock.mockImplementation(
      (input) =>
        new Promise((_resolve, reject) => {
          const signal = requestOf(input).signal
          fetchSignal = signal
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          )
        }),
    )
    const controller = new AbortController()
    const request = store.dispatch(
      paymentsApi.endpoints.payment.initiate('pi_guest', { subscribe: false }),
    )
    controller.signal.addEventListener('abort', () => request.abort(), {
      once: true,
    })
    const pending = request.unwrap().catch((error: unknown) => error)
    await vi.waitFor(() => expect(capturedRequests).toHaveLength(1))

    controller.abort()

    expect(await pending).toMatchObject({ name: 'AbortError' })
    await vi.waitFor(() => expect(fetchSignal?.aborted).toBe(true))
    expect(capturedRequests[0]!.credentials).toBe('include')
    expect(refresh).not.toHaveBeenCalled()
    expect(expire).not.toHaveBeenCalled()
    expect(accessToken).toBe('old-token')
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
    await store
      .dispatch(
        paymentsApi.endpoints.payment.initiate('pi_guest', {
          subscribe: false,
          forceRefetch: true,
        }),
      )
      .unwrap()
    await store
      .dispatch(paymentsApi.endpoints.cancelPayment.initiate('pi_guest'))
      .unwrap()
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
