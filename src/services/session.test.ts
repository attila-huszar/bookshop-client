import { vi } from 'vitest'

async function setup() {
  vi.resetModules()
  const user = { accessToken: null as string | null }
  const dispatch = vi.fn<() => Promise<void>>(() => Promise.resolve())
  vi.doMock('@/store/store', () => ({
    store: { getState: () => ({ user }), dispatch },
  }))
  vi.doMock('@/store/thunks/user', () => ({ fetchAuthTokens: vi.fn() }))
  const { bootstrapSession } = await import('./session')

  return { bootstrapSession, user, dispatch }
}

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('session bootstrap', () => {
  it('reuses an existing access token without making a request', async () => {
    const { bootstrapSession, user, dispatch } = await setup()
    user.accessToken = 'access-token'

    await bootstrapSession()

    expect(dispatch).not.toHaveBeenCalled()
  })

  it('shares one pending cookie refresh across startup and checkout', async () => {
    const { bootstrapSession, user, dispatch } = await setup()
    let finish!: () => void
    dispatch.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = () => {
            user.accessToken = 'access-token'
            resolve()
          }
        }),
    )

    const first = bootstrapSession()
    const second = bootstrapSession()
    expect(dispatch).toHaveBeenCalledTimes(1)

    finish()
    await Promise.all([first, second])
    await bootstrapSession()
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('counts concurrent guest attempts once and backs off subsequent refreshes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const { bootstrapSession, dispatch } = await setup()

    await Promise.all([
      bootstrapSession(),
      bootstrapSession(),
      bootstrapSession(),
    ])
    await bootstrapSession()
    expect(dispatch).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.now() + 1_000)
    await bootstrapSession()
    expect(dispatch).toHaveBeenCalledTimes(2)

    vi.setSystemTime(Date.now() + 1_000)
    await bootstrapSession()
    expect(dispatch).toHaveBeenCalledTimes(2)

    vi.setSystemTime(Date.now() + 1_000)
    await bootstrapSession()
    expect(dispatch).toHaveBeenCalledTimes(3)
  })

  it('resets guest backoff after a session is established', async () => {
    const { bootstrapSession, user, dispatch } = await setup()
    await bootstrapSession()
    user.accessToken = 'access-token'
    await bootstrapSession()
    user.accessToken = null
    await bootstrapSession()

    expect(dispatch).toHaveBeenCalledTimes(2)
  })
})
