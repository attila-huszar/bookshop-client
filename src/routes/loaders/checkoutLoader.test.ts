import { store } from '@/store/store'
import {
  recoverCheckout,
  resetCheckout,
  restoreCheckout,
} from '@/services/checkout'
import { bootstrapSession } from '@/services/session'
import { checkoutLoader } from './checkoutLoader'

vi.mock('@/services/session', () => ({ bootstrapSession: vi.fn() }))
vi.mock('@/services/checkout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/checkout')>()),
  restoreCheckout: vi.fn(),
}))

const session = { paymentId: 'pi_test', paymentToken: 'secret', amount: 1200 }
const location = (result: unknown) =>
  result instanceof Response ? result.headers.get('Location') : undefined
const load = (query = '', signal?: AbortSignal) =>
  checkoutLoader({
    request: new Request('http://localhost/checkout' + query, { signal }),
  })

beforeEach(() => {
  vi.clearAllMocks()
  store.dispatch(resetCheckout())
  store.dispatch(recoverCheckout('pi_test'))
  vi.mocked(bootstrapSession).mockResolvedValue(undefined)
  vi.mocked(restoreCheckout).mockImplementation(
    () => () =>
      Promise.resolve({
        type: 'ready',
        payment: session,
        status: 'requires_payment_method',
      }),
  )
})

afterEach(() => {
  store.dispatch(resetCheckout())
})

describe('checkout loader routing', () => {
  it('redirects home without an active checkout', async () => {
    store.dispatch(resetCheckout())

    expect(location(await load())).toBe('/')
    expect(bootstrapSession).not.toHaveBeenCalled()
    expect(restoreCheckout).not.toHaveBeenCalled()
  })

  it.each([
    [
      '?payment_intent=pi_return&payment_intent_client_secret=secret&redirect_status=succeeded',
      '/checkout?redirect_status=succeeded',
    ],
    ['?payment_intent=pi_return', '/checkout'],
    [
      '?payment_intent_client_secret=secret&source=cart&source=retry',
      '/checkout?source=cart&source=retry',
    ],
    ['?payment_intent=&payment_intent_client_secret=', '/checkout'],
  ])(
    'strips Stripe secrets before auth or network requests: %s',
    async (query, expected) => {
      expect(location(await load(query))).toBe(expected)
      expect(bootstrapSession).not.toHaveBeenCalled()
      expect(restoreCheckout).not.toHaveBeenCalled()
    },
  )

  it('adopts the Stripe return ID before stripping the URL', async () => {
    await load('?payment_intent=pi_return&payment_intent_client_secret=secret')

    expect(store.dispatch(recoverCheckout(null))).toBe('pi_return')
    expect(restoreCheckout).not.toHaveBeenCalled()
  })

  it('recovers a Stripe return when browser storage was empty', async () => {
    store.dispatch(resetCheckout())

    expect(location(await load('?payment_intent=pi_return'))).toBe('/checkout')
    expect(store.dispatch(recoverCheckout(null))).toBe('pi_return')
  })

  it('bootstraps authentication before restoring the checkout', async () => {
    let finish!: () => void
    vi.mocked(bootstrapSession).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve
      }),
    )
    const pending = load()
    expect(restoreCheckout).not.toHaveBeenCalled()
    finish()

    await expect(pending).resolves.toBeUndefined()
    expect(vi.mocked(restoreCheckout).mock.calls[0]?.[0]).toBe('pi_test')
    expect(
      vi.mocked(restoreCheckout).mock.calls[0]?.[1]?.signal,
    ).toBeInstanceOf(AbortSignal)
    expect(vi.mocked(restoreCheckout).mock.calls[0]?.[1]?.reuseExisting).toBe(
      false,
    )
  })

  it('does not restore after navigation is canceled during authentication', async () => {
    let finish!: () => void
    vi.mocked(bootstrapSession).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve
      }),
    )
    const controller = new AbortController()
    const pending = load('', controller.signal)
    controller.abort()
    finish()

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(restoreCheckout).not.toHaveBeenCalled()
  })

  it('permits a matching ready session to be reused on a Stripe return', async () => {
    await load('?redirect_status=succeeded')

    expect(vi.mocked(restoreCheckout).mock.calls[0]?.[1]?.reuseExisting).toBe(
      true,
    )
  })

  it.each(['succeeded', 'requires_capture', 'processing'] as const)(
    'routes restored %s payments to status view',
    async (status) => {
      vi.mocked(restoreCheckout).mockImplementation(
        () => () =>
          Promise.resolve({ type: 'ready', payment: session, status }),
      )

      expect(location(await load('?source=cart'))).toBe(
        '/checkout?source=cart&redirect_status=' + status,
      )
    },
  )

  it('redirects home when the coordinator clears an unavailable checkout', async () => {
    vi.mocked(restoreCheckout).mockImplementation(
      () => () => Promise.resolve({ type: 'cleared' }),
    )

    expect(location(await load())).toBe('/')
  })

  it('leaves transient errors to the checkout retry UI', async () => {
    vi.mocked(restoreCheckout).mockImplementation(
      () => () => Promise.reject(new Error('Offline')),
    )

    await expect(load()).resolves.toBeUndefined()
    expect(store.dispatch(recoverCheckout(null))).toBe('pi_test')
  })

  it('does not redirect a stale result', async () => {
    vi.mocked(restoreCheckout).mockImplementation(
      () => () => Promise.resolve({ type: 'stale' }),
    )

    await expect(load()).resolves.toBeUndefined()
  })

  it('does not redirect after navigation is canceled during restoration', async () => {
    const controller = new AbortController()
    vi.mocked(restoreCheckout).mockImplementation(() => () => {
      controller.abort()

      return Promise.resolve({ type: 'cleared' })
    })

    await expect(load('', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
