import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersTransport from '@/api/users'
import { UserRole } from '@/types'
import { booksApi } from '../api/booksApi'
import { bookshopApi } from '../api/bookshopApi'
import { ordersApi } from '../api/ordersApi'
import { usersApi } from '../api/usersApi'
import { userSelector } from '../selectors'
import { authSessionChanged } from '../slices/user'
import { createAppStore } from '../store'
import { bootstrapSession, fetchAuthTokens, login, logout } from './user'

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
let store: ReturnType<typeof createAppStore>

describe('session bootstrap', () => {
  beforeEach(async () => {
    await store.dispatch(bootstrapSession())
    store.dispatch(authSessionChanged(null))
    vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reuses an existing access token without making a request', async () => {
    store.dispatch(authSessionChanged('access-token'))

    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).not.toHaveBeenCalled()
  })

  it('shares one pending cookie refresh across startup and checkout', async () => {
    let finish!: () => void
    vi.mocked(usersTransport.retrieveAuthTokens).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ accessToken: 'restored-token' })
        }),
    )

    const first = store.dispatch(bootstrapSession())
    const second = store.dispatch(bootstrapSession())
    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)

    finish()
    await Promise.all([first, second])
    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(1)
    expect(store.getState().user.accessToken).toBe('restored-token')
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
    store.dispatch(authSessionChanged('access-token'))
    await store.dispatch(bootstrapSession())
    store.dispatch(authSessionChanged(null))
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
    store.dispatch(authSessionChanged(null))
    await store.dispatch(bootstrapSession())

    expect(usersTransport.retrieveAuthTokens).toHaveBeenCalledTimes(3)
  })
})

beforeEach(async () => {
  store = createAppStore()
  store.dispatch(authSessionChanged('old-token'))
  await store.dispatch(
    usersApi.util.upsertQueryData('userProfile', undefined, profile),
  )
  await store.dispatch(
    ordersApi.util.upsertQueryData('userOrders', undefined, []),
  )
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
})

describe('authentication workflows', () => {
  it('sets the new login session and clears data from the previous account', async () => {
    vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue({
      accessToken: 'new-token',
      firstName: 'New',
    })

    await store
      .dispatch(login({ email: 'new@example.com', password: 'Password123!' }))
      .unwrap()

    expect(store.getState().user.accessToken).toBe('new-token')
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

    expect(store.getState().user.accessToken).toBeNull()
    expect(store.getState().bookshopApi.queries).toEqual({})
  })

  it('preserves query data during a successful refresh of the same session', async () => {
    vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: 'refreshed-token',
    })

    await store.dispatch(fetchAuthTokens()).unwrap()

    expect(store.getState().user.accessToken).toBe('refreshed-token')
    expect(userSelector(store.getState()).userData).toEqual(profile)
    expect(
      ordersApi.endpoints.userOrders.select()(store.getState()).isSuccess,
    ).toBe(true)
  })

  it.each(['guest', 'failed'])(
    'preserves public recommendations when a guest session check is %s',
    async (outcome) => {
      store.dispatch(authSessionChanged(null))
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

      expect(store.getState().user.accessToken).toBeNull()
      expect(current.isSuccess).toBe(true)
      expect(current.data).toBe(cached.data)
      expect(current.fulfilledTimeStamp).toBe(cached.fulfilledTimeStamp)
    },
  )

  it('clears cached queries when restoring a logged-in session for a guest', async () => {
    store.dispatch(authSessionChanged(null))
    store.dispatch(bookshopApi.util.resetApiState())
    await store.dispatch(
      booksApi.util.upsertQueryData('booksByProperty', 'recommended', []),
    )
    vi.spyOn(usersTransport, 'retrieveAuthTokens').mockResolvedValue({
      accessToken: 'restored-token',
    })

    await store.dispatch(fetchAuthTokens()).unwrap()

    expect(store.getState().user.accessToken).toBe('restored-token')
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

      expect(store.getState().user.accessToken).toBeNull()
      expect(userSelector(store.getState()).userData).toBeNull()
      expect(store.getState().bookshopApi.queries).toEqual({})
    },
  )

  it.each(['successful', 'expired', 'failed'])(
    'preserves a newer login and its private data when an older refresh is %s',
    async (outcome) => {
      let finishRefresh!: () => void

      vi.spyOn(usersTransport, 'retrieveAuthTokens').mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            finishRefresh = () => {
              if (outcome === 'failed') {
                reject(new Error('Session expired'))

                return
              }

              resolve({
                accessToken: outcome === 'expired' ? null : 'refreshed-token',
              })
            }
          }),
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
      finishRefresh()
      await pendingRefresh

      expect(store.getState().user.accessToken).toBe('new-login-token')
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

    expect(store.getState().user.accessToken).toBe('old-token')
    expect(userSelector(store.getState()).userData).toEqual(profile)
  })
})
