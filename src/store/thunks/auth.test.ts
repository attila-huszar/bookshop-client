import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersTransport from '@/api/users'
import { UserRole } from '@/types'
import { booksApi } from '../api/booksApi'
import { bookshopApi } from '../api/bookshopApi'
import { ordersApi } from '../api/ordersApi'
import { usersApi } from '../api/usersApi'
import { userSelector } from '../selectors'
import { authSessionChangeCompleted } from '../slices/auth'
import { createAppStore } from '../store'
import {
  bootstrapSession,
  fetchAuthTokens,
  listenForSessionChanges,
  login,
  logout,
} from './auth'

const profile = {
  uuid: '11111111-1111-4111-8111-111111111111',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  country: 'us',
  phone: null,
  address: null,
  avatar: null,
  role: UserRole.User,
}
const oldToken = token(profile.uuid, 1)
let store: ReturnType<typeof createAppStore>

function token(uuid: string, iat: number) {
  return `header.${btoa(JSON.stringify({ uuid, iat }))}.signature`
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((done, fail) => {
    resolve = done
    reject = fail
  })

  return { promise, resolve, reject }
}

async function seedPrivateQueries() {
  await store.dispatch(
    usersApi.util.upsertQueryData('userProfile', undefined, profile),
  )
  await store.dispatch(
    ordersApi.util.upsertQueryData('userOrders', undefined, []),
  )
}

beforeEach(async () => {
  store = createAppStore()
  store.dispatch(authSessionChangeCompleted(oldToken))
  // An established session resets module-level guest retry backoff.
  await store.dispatch(bootstrapSession())
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('session bootstrap', () => {
  beforeEach(() => {
    store.dispatch(authSessionChangeCompleted(null))
    vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: null,
    })
  })

  it('reuses an existing access token without making a request', async () => {
    store.dispatch(authSessionChangeCompleted('access-token'))

    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).not.toHaveBeenCalled()
  })

  it('shares one pending cookie refresh across startup and checkout', async () => {
    const pending = deferred<{ accessToken: string | null }>()
    vi.mocked(usersTransport.retrieveAuthTokens).mockReturnValueOnce(
      pending.promise,
    )

    const first = store.dispatch(bootstrapSession())
    const second = store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)

    pending.resolve({ accessToken: 'restored-token' })
    await Promise.all([first, second])
    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.accessToken).toBe('restored-token')
  })

  it('counts concurrent guest attempts once and backs off subsequent refreshes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    await Promise.all([
      store.dispatch(bootstrapSession()),
      store.dispatch(bootstrapSession()),
      store.dispatch(bootstrapSession()),
    ])
    await store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.now() + 1_000)
    await store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(2)

    vi.setSystemTime(Date.now() + 1_000)
    await store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(2)

    vi.setSystemTime(Date.now() + 1_000)
    await store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(3)
  })

  it('resets guest backoff after a session is established', async () => {
    await store.dispatch(bootstrapSession())
    store.dispatch(authSessionChangeCompleted('access-token'))
    await store.dispatch(bootstrapSession())
    store.dispatch(authSessionChangeCompleted(null))
    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(2)
  })

  it('stops refreshing after four unsuccessful guest attempts', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const startedAt = Date.now()

    for (const elapsed of [0, 1_000, 3_000, 7_000]) {
      vi.setSystemTime(startedAt + elapsed)
      await store.dispatch(bootstrapSession())
    }

    vi.setSystemTime(startedAt + 60_000)
    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(4)
  })

  it('resets guest backoff when a cookie refresh establishes the session', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    await store.dispatch(bootstrapSession())
    vi.setSystemTime(Date.now() + 1_000)
    vi.mocked(usersTransport.retrieveAuthTokens).mockResolvedValueOnce({
      accessToken: 'restored-token',
    })
    await store.dispatch(bootstrapSession())
    store.dispatch(authSessionChangeCompleted(null))
    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(3)
  })
})

describe('authentication workflows', () => {
  beforeEach(seedPrivateQueries)

  it('sets the new login session and clears data from the previous account', async () => {
    vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue({
      accessToken: 'new-token',
      firstName: 'New',
    })

    await store
      .dispatch(login({ email: 'new@example.com', password: 'Password123!' }))
      .unwrap()

    expect(store.getState().auth.accessToken).toBe('new-token')
    expect(userSelector(store.getState()).userData).toBeNull()
    expect(store.getState().bookshopApi.queries).toEqual({})
  })

  it('clears a failed login session and its private data', async () => {
    vi.spyOn(usersTransport, 'postUserLogin').mockRejectedValue(
      new Error('Login failed'),
    )

    await expect(
      store
        .dispatch(
          login({ email: 'new@example.com', password: 'WrongPass123!' }),
        )
        .unwrap(),
    ).rejects.toMatchObject({ message: 'Login failed' })

    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().bookshopApi.queries).toEqual({})
  })

  it.each(['same account', 'different account'])(
    'preserves query data only for the %s during token refresh',
    async (account) => {
      const refreshedToken = token(
        account === 'same account'
          ? profile.uuid
          : '22222222-2222-4222-8222-222222222222',
        2,
      )
      vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
        accessToken: refreshedToken,
      })

      await store.dispatch(fetchAuthTokens()).unwrap()

      expect(store.getState().auth.accessToken).toBe(refreshedToken)
      expect(userSelector(store.getState()).userData).toEqual(
        account === 'same account' ? profile : null,
      )
      expect(
        ordersApi.endpoints.userOrders.select()(store.getState()).isSuccess,
      ).toBe(account === 'same account')
    },
  )

  it.each(['refresh', 'session-check'] as const)(
    'handles an unreadable account identity during %s',
    async (mode) => {
      vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
        accessToken: 'unreadable-new-token',
      })

      await store.dispatch(fetchAuthTokens(mode)).unwrap()

      expect(store.getState().auth.accessToken).toBe('unreadable-new-token')
      expect(userSelector(store.getState()).userData).toEqual(
        mode === 'session-check' ? null : profile,
      )
    },
  )

  it.each(['login', 'logout'])(
    'invalidates an older refresh as soon as %s starts, preserving the current session until completion',
    async (operation) => {
      const pendingRefresh = deferred<{ accessToken: string | null }>()
      const pendingChange = deferred<void>()
      vi.spyOn(usersTransport, 'retrieveAuthTokens').mockReturnValue(
        pendingRefresh.promise,
      )
      vi.spyOn(usersTransport, 'postUserLogin').mockImplementation(async () => {
        await pendingChange.promise

        return { accessToken: 'new-token', firstName: 'New' }
      })
      vi.spyOn(usersTransport, 'postUserLogout').mockImplementation(
        async () => {
          await pendingChange.promise

          return { success: true }
        },
      )

      const refresh = store.dispatch(fetchAuthTokens())
      const change =
        operation === 'login'
          ? store.dispatch(
              login({ email: 'new@example.com', password: 'Password123!' }),
            )
          : store.dispatch(logout())
      pendingRefresh.resolve({ accessToken: 'obsolete-token' })
      await refresh

      expect(store.getState().auth.accessToken).toBe(oldToken)
      expect(userSelector(store.getState()).userData).toEqual(profile)

      pendingChange.resolve()
      await change
    },
  )

  it.each(['guest', 'failed'])(
    'preserves public recommendations when a guest session check is %s',
    async (outcome) => {
      store.dispatch(authSessionChangeCompleted(null))
      store.dispatch(bookshopApi.util.resetApiState())
      await store.dispatch(
        booksApi.util.upsertQueryData('booksByProperty', 'recommended', []),
      )
      const cached = booksApi.endpoints.booksByProperty.select('recommended')(
        store.getState(),
      )
      const refresh = vi.spyOn(usersTransport, 'retrieveAuthTokens')

      if (outcome === 'guest') {
        refresh.mockResolvedValue({ accessToken: null })
      } else {
        refresh.mockRejectedValue(new Error('Network unavailable'))
      }

      await store.dispatch(fetchAuthTokens())
      const current = booksApi.endpoints.booksByProperty.select('recommended')(
        store.getState(),
      )

      expect(store.getState().auth.accessToken).toBeNull()
      expect(current.isSuccess).toBe(true)
      expect(current.data).toBe(cached.data)
      expect(current.fulfilledTimeStamp).toBe(cached.fulfilledTimeStamp)
    },
  )

  it('clears cached queries when restoring a logged-in session for a guest', async () => {
    store.dispatch(authSessionChangeCompleted(null))
    store.dispatch(bookshopApi.util.resetApiState())
    await store.dispatch(
      booksApi.util.upsertQueryData('booksByProperty', 'recommended', []),
    )
    vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: 'restored-token',
    })

    await store.dispatch(fetchAuthTokens()).unwrap()

    expect(store.getState().auth.accessToken).toBe('restored-token')
    expect(store.getState().bookshopApi.queries).toEqual({})
  })

  it.each(['expired', 'failed'])(
    'clears private data when refresh is %s',
    async (result) => {
      const refresh = vi.spyOn(usersTransport, 'retrieveAuthTokens')

      if (result === 'expired') {
        refresh.mockResolvedValue({ accessToken: null })
      } else {
        refresh.mockRejectedValue(new Error('Session expired'))
      }

      await store.dispatch(fetchAuthTokens())

      expect(store.getState().auth.accessToken).toBeNull()
      expect(userSelector(store.getState()).userData).toBeNull()
      expect(store.getState().bookshopApi.queries).toEqual({})
    },
  )

  it.each(['successful', 'expired', 'failed'])(
    'preserves a newer login and its private data when an older refresh is %s',
    async (outcome) => {
      const pending = deferred<{ accessToken: string | null }>()
      vi.spyOn(usersTransport, 'retrieveAuthTokens').mockReturnValue(
        pending.promise,
      )
      vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue({
        accessToken: 'new-login-token',
        firstName: 'New',
      })
      const pendingRefresh = store.dispatch(fetchAuthTokens())

      await store
        .dispatch(login({ email: 'new@example.com', password: 'Password123!' }))
        .unwrap()
      const newProfile = { ...profile, email: 'new@example.com' }

      await store.dispatch(
        usersApi.util.upsertQueryData('userProfile', undefined, newProfile),
      )
      if (outcome === 'failed') {
        pending.reject(new Error('Session expired'))
      } else {
        pending.resolve({
          accessToken: outcome === 'expired' ? null : 'refreshed-token',
        })
      }

      await pendingRefresh

      expect(store.getState().auth.accessToken).toBe('new-login-token')
      expect(userSelector(store.getState()).userData).toEqual(newProfile)
    },
  )

  it('preserves the session and private cache when logout fails', async () => {
    vi.spyOn(usersTransport, 'postUserLogout').mockRejectedValue(
      new Error('Logout failed'),
    )

    await expect(store.dispatch(logout()).unwrap()).rejects.toMatchObject({
      message: 'Logout failed',
    })

    expect(store.getState().auth.accessToken).toBe(oldToken)
    expect(userSelector(store.getState()).userData).toEqual(profile)
  })
})

describe('cross-tab sessions', () => {
  let stop: (() => void) | undefined
  let channel: {
    onmessage: ((event: MessageEvent<unknown>) => void) | null
    postMessage: ReturnType<typeof vi.fn>
    close: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    await seedPrivateQueries()
    vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: null,
    })
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    channel = { onmessage: null, postMessage: vi.fn(), close: vi.fn() }
    vi.stubGlobal(
      'BroadcastChannel',
      vi.fn(function () {
        return channel
      }),
    )
  })

  afterEach(() => {
    stop?.()
    stop = undefined
    vi.unstubAllGlobals()
  })

  function receiveChange() {
    channel.onmessage?.(
      new MessageEvent('message', { data: 'session-changed' }),
    )
  }

  it('immediately clears the old account and restores cookies without rebroadcasting', async () => {
    const pending = deferred<{ accessToken: string | null }>()
    vi.mocked(usersTransport.retrieveAuthTokens).mockReturnValue(
      pending.promise,
    )
    stop = listenForSessionChanges(store)

    receiveChange()

    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().bookshopApi.queries).toEqual({})
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)

    pending.resolve({ accessToken: 'other-account-token' })
    await vi.waitFor(() =>
      expect(store.getState().auth.accessToken).toBe('other-account-token'),
    )
    expect(channel.postMessage).not.toHaveBeenCalled()
  })

  it('bypasses guest retry backoff after a login notification', async () => {
    store.dispatch(authSessionChangeCompleted(null))
    await store.dispatch(bootstrapSession())
    await store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)
    vi.mocked(usersTransport.retrieveAuthTokens).mockResolvedValue({
      accessToken: 'other-tab-login',
    })
    stop = listenForSessionChanges(store)

    receiveChange()

    await vi.waitFor(() =>
      expect(store.getState().auth.accessToken).toBe('other-tab-login'),
    )
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(2)
  })

  it('does not restore an older guest refresh after another tab logs out', async () => {
    const pending = deferred<{ accessToken: string | null }>()
    store.dispatch(authSessionChangeCompleted(null))
    vi.mocked(usersTransport.retrieveAuthTokens).mockReturnValueOnce(
      pending.promise,
    )
    const oldRefresh = store.dispatch(bootstrapSession())
    stop = listenForSessionChanges(store)

    receiveChange()
    await vi.waitFor(() =>
      expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(2),
    )
    pending.resolve({ accessToken: 'obsolete-token' })
    await oldRefresh

    expect(store.getState().auth.accessToken).toBeNull()
    expect(channel.postMessage).not.toHaveBeenCalled()
  })

  it.each(['successful', 'failed'])(
    'ignores an older %s login after a remote logout',
    async (outcome) => {
      const pending = deferred<{ accessToken: string; firstName: string }>()
      vi.spyOn(usersTransport, 'postUserLogin').mockReturnValue(pending.promise)
      const oldLogin = store.dispatch(
        login({ email: 'old@example.com', password: 'Password123!' }),
      )
      stop = listenForSessionChanges(store)
      receiveChange()
      await store.dispatch(bootstrapSession({ force: true }))

      if (outcome === 'successful') {
        pending.resolve({ accessToken: 'obsolete-token', firstName: 'Old' })
      } else {
        pending.reject(new Error('Login failed'))
      }

      await oldLogin

      expect(store.getState().auth.accessToken).toBeNull()
    },
  )

  it('ignores an older logout after a remote login', async () => {
    const pending = deferred<{ success: boolean }>()
    vi.spyOn(usersTransport, 'postUserLogout').mockReturnValue(pending.promise)
    const oldLogout = store.dispatch(logout())
    vi.mocked(usersTransport.retrieveAuthTokens).mockResolvedValue({
      accessToken: 'other-tab-login',
    })
    stop = listenForSessionChanges(store)
    receiveChange()
    await store.dispatch(bootstrapSession({ force: true }))
    pending.resolve({ success: true })
    await oldLogout

    expect(store.getState().auth.accessToken).toBe('other-tab-login')
  })

  it('only broadcasts a signal after successful explicit login and logout', async () => {
    vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue({
      accessToken: 'new-token',
      firstName: 'New',
    })
    vi.spyOn(usersTransport, 'postUserLogout').mockResolvedValue({
      success: true,
    })
    stop = listenForSessionChanges(store)

    await store.dispatch(
      login({ email: 'new@example.com', password: 'Password123!' }),
    )
    expect(channel.postMessage).toHaveBeenCalledExactlyOnceWith(
      'session-changed',
    )
    await store.dispatch(fetchAuthTokens())
    expect(channel.postMessage).toHaveBeenCalledTimes(1)
    await store.dispatch(logout())
    expect(channel.postMessage.mock.calls).toEqual([
      ['session-changed'],
      ['session-changed'],
    ])
  })

  it('does not broadcast failed login or logout attempts', async () => {
    vi.spyOn(usersTransport, 'postUserLogin').mockRejectedValue(
      new Error('Login failed'),
    )
    vi.spyOn(usersTransport, 'postUserLogout').mockRejectedValue(
      new Error('Logout failed'),
    )
    stop = listenForSessionChanges(store)

    await store.dispatch(
      login({ email: 'new@example.com', password: 'WrongPass123!' }),
    )
    await store.dispatch(logout())

    expect(channel.postMessage).not.toHaveBeenCalled()
  })

  it('keeps login working if sending a notification throws', async () => {
    vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue({
      accessToken: 'new-token',
      firstName: 'New',
    })
    stop = listenForSessionChanges(store)
    channel.postMessage.mockImplementation(() => {
      throw new Error('Unavailable')
    })

    await store
      .dispatch(login({ email: 'new@example.com', password: 'Password123!' }))
      .unwrap()

    expect(store.getState().auth.accessToken).toBe('new-token')
  })

  it('restores the cookie session on foreground without BroadcastChannel support', async () => {
    vi.stubGlobal('BroadcastChannel', undefined)
    const pending = deferred<{ accessToken: string | null }>()
    vi.mocked(usersTransport.retrieveAuthTokens).mockReturnValue(
      pending.promise,
    )
    stop = listenForSessionChanges(store)

    window.dispatchEvent(new Event('focus'))
    window.dispatchEvent(new Event('pageshow'))
    document.dispatchEvent(new Event('visibilitychange'))
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)
    pending.resolve({ accessToken: 'current-cookie-token' })

    await vi.waitFor(() =>
      expect(store.getState().auth.accessToken).toBe('current-cookie-token'),
    )
    expect(store.getState().bookshopApi.queries).toEqual({})
  })

  it('ignores unrelated messages and background events, and cleans up listeners', () => {
    stop = listenForSessionChanges(store)
    channel.onmessage?.(
      new MessageEvent('message', { data: { type: 'unknown' } }),
    )
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(usersTransport.retrieveAuthTokens).not.toHaveBeenCalled()

    stop()
    expect(channel.close).toHaveBeenCalledTimes(1)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    window.dispatchEvent(new Event('focus'))
    expect(usersTransport.retrieveAuthTokens).not.toHaveBeenCalled()
    stop = undefined
  })

  it('does not join an older bootstrap or let it overwrite a newer foreground check', async () => {
    const pending = deferred<{ accessToken: string | null }>()
    store.dispatch(authSessionChangeCompleted(null))
    vi.mocked(usersTransport.retrieveAuthTokens).mockReturnValueOnce(
      pending.promise,
    )
    const oldBootstrap = store.dispatch(bootstrapSession())
    stop = listenForSessionChanges(store)
    window.dispatchEvent(new Event('focus'))
    await store.dispatch(bootstrapSession({ force: true }))

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(2)
    pending.resolve({ accessToken: 'obsolete-token' })
    await oldBootstrap

    expect(store.getState().auth.accessToken).toBeNull()
  })

  it.each(['same account', 'different account'])(
    'preserves cached data only for the %s during foreground restoration',
    async (account) => {
      vi.mocked(usersTransport.retrieveAuthTokens).mockResolvedValue({
        accessToken: token(
          account === 'same account'
            ? profile.uuid
            : '22222222-2222-4222-8222-222222222222',
          2,
        ),
      })
      stop = listenForSessionChanges(store)
      window.dispatchEvent(new Event('focus'))
      await store.dispatch(bootstrapSession({ force: true }))

      expect(userSelector(store.getState()).userData).toEqual(
        account === 'same account' ? profile : null,
      )
    },
  )

  it('preserves an authenticated session and private data if a foreground check fails', async () => {
    vi.mocked(usersTransport.retrieveAuthTokens).mockRejectedValue(
      new Error('Offline'),
    )
    stop = listenForSessionChanges(store)
    window.dispatchEvent(new Event('focus'))
    await store.dispatch(bootstrapSession({ force: true }))

    expect(store.getState().auth.accessToken).toBe(oldToken)
    expect(userSelector(store.getState()).userData).toEqual(profile)
  })
})
