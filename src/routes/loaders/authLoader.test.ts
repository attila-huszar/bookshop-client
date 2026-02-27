import { vi } from 'vitest'
import { type User, UserRole } from '@/types'

type SetupOptions = {
  initialAccessToken?: string | null
  initialUserData?: User | null
  tokenAfterFetch?: string | null
  profileAfterFetch?: User | null
  tokenDispatchPromise?: Promise<unknown>
  profileDispatchPromise?: Promise<unknown>
}

const createUser = (role: UserRole = UserRole.User): User => ({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  country: 'us',
  phone: '123',
  address: {
    city: 'Budapest',
    country: 'HU',
    line1: 'line1',
    line2: undefined,
    postal_code: '1111',
    state: undefined,
  },
  avatar: '',
  role,
})

const createDeferred = () => {
  let resolve: (value?: unknown) => void = () => undefined
  const promise = new Promise<unknown>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

const setup = async (options: SetupOptions = {}) => {
  vi.resetModules()

  const userState = {
    accessToken: options.initialAccessToken ?? null,
    userData: options.initialUserData ?? null,
  }

  const mockFetchAuthTokens = vi.fn(() => ({ type: 'fetchAuthTokens' }))
  const mockFetchUserProfile = vi.fn(() => ({ type: 'fetchUserProfile' }))

  const mockDispatch = vi.fn(async (action: { type: string }) => {
    if (action.type === 'fetchAuthTokens') {
      if (options.tokenDispatchPromise) await options.tokenDispatchPromise
      userState.accessToken = options.tokenAfterFetch ?? null
    }

    if (action.type === 'fetchUserProfile') {
      if (options.profileDispatchPromise) await options.profileDispatchPromise
      userState.userData = options.profileAfterFetch ?? null
    }

    return {}
  })

  const mockGetState = vi.fn(() => ({ user: userState }))

  vi.doMock('@/store', () => ({
    fetchAuthTokens: mockFetchAuthTokens,
    fetchUserProfile: mockFetchUserProfile,
    store: {
      dispatch: mockDispatch,
      getState: mockGetState,
    },
  }))

  const { authLoader } = await import('./authLoader')

  return {
    authLoader,
    mockDispatch,
    mockFetchAuthTokens,
    mockFetchUserProfile,
  }
}

describe('authLoader', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns true immediately when already authenticated user is admin for admin route', async () => {
    const { authLoader, mockDispatch } = await setup({
      initialAccessToken: 'access-token',
      initialUserData: createUser(UserRole.Admin),
    })

    const result = await authLoader({ adminRequired: true })

    expect(result).toBe(true)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('returns false for protected route when token bootstrap fails', async () => {
    const { authLoader, mockFetchAuthTokens, mockDispatch } = await setup({
      tokenAfterFetch: null,
    })

    const result = await authLoader({ loginRequired: true })

    expect(result).toBe(false)
    expect(mockFetchAuthTokens).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledTimes(1)
  })

  it('allows guest route and skips immediate token retry during backoff window', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const { authLoader, mockDispatch } = await setup({
      tokenAfterFetch: null,
    })

    const firstResult = await authLoader()
    const secondResult = await authLoader()

    expect(firstResult).toBe(true)
    expect(secondResult).toBe(true)
    expect(mockDispatch).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1_000)
    await authLoader()

    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })

  it('fetches profile after successful token bootstrap', async () => {
    const { authLoader, mockFetchAuthTokens, mockFetchUserProfile } =
      await setup({
        tokenAfterFetch: 'access-token',
        profileAfterFetch: createUser(UserRole.User),
      })

    const result = await authLoader({ loginRequired: true })

    expect(result).toBe(true)
    expect(mockFetchAuthTokens).toHaveBeenCalledTimes(1)
    expect(mockFetchUserProfile).toHaveBeenCalledTimes(1)
  })

  it('rejects admin route when loaded profile is non-admin', async () => {
    const { authLoader, mockFetchAuthTokens, mockFetchUserProfile } =
      await setup({
        tokenAfterFetch: 'access-token',
        profileAfterFetch: createUser(UserRole.User),
      })

    const result = await authLoader({ adminRequired: true })

    expect(result).toBe(false)
    expect(mockFetchAuthTokens).toHaveBeenCalledTimes(1)
    expect(mockFetchUserProfile).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent token/profile bootstrap dispatches', async () => {
    const deferredToken = createDeferred()
    const deferredProfile = createDeferred()

    const { authLoader, mockDispatch } = await setup({
      tokenAfterFetch: 'access-token',
      profileAfterFetch: createUser(UserRole.User),
      tokenDispatchPromise: deferredToken.promise,
      profileDispatchPromise: deferredProfile.promise,
    })

    const firstCall = authLoader()
    const secondCall = authLoader()
    await Promise.resolve()

    expect(mockDispatch).toHaveBeenCalledTimes(1)

    deferredToken.resolve()
    deferredProfile.resolve()

    await expect(firstCall).resolves.toBe(true)
    await expect(secondCall).resolves.toBe(true)
    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })
})
