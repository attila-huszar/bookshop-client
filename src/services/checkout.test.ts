import ky from 'ky'
import * as privateApi from '@/api/authRequest'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import {
  cartAdd,
  cartClear,
  cartQuantitySet,
  cartRestored,
} from '@/store/slices/cart'
import { checkoutReady } from '@/store/slices/payment'
import { createAppStore } from '@/store/store'
import {
  localStorageAdapter,
  sessionStorageAdapter,
} from '@/helpers/browserStorage'
import { cartKey, paymentIdempotencyKey, paymentIdKey } from '@/constants/keys'
import type { PaymentIntentResponse } from '@/types'
import { HttpErrorCode, PaymentErrorCode } from '@/types/ApiError'
import {
  cancelCheckout,
  getCheckoutPaymentId,
  listenForCheckoutChanges,
  recoverCheckout,
  resetCheckout,
  restoreCheckout,
  startCheckout,
} from './checkout'

const payment = { items: [{ id: 7, quantity: 1 }], expectedTotal: 12 }
const session = (paymentId = 'pi_test') => ({
  paymentId,
  paymentToken: paymentId + '_secret',
  amount: 1200,
})
const intent = (
  id = 'pi_test',
  status: PaymentIntentResponse['status'] = 'requires_payment_method',
) => ({
  id,
  status,
  client_secret: id + '_secret',
  amount: 1200,
  currency: 'usd',
  receipt_email: null,
  shipping: null,
  created: 1,
})
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
function deferredResponse() {
  let resolve!: (response: Response) => void
  const promise = new Promise<Response>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

let store: ReturnType<typeof createAppStore>
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>
let requests: Request[]
let lockQueue: Promise<unknown>
const requestLock = vi.fn((_name: string, callback: () => unknown) => {
  const result = lockQueue.then(callback)
  lockQueue = result.catch(() => undefined)

  return result
})

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  lockQueue = Promise.resolve()
  vi.stubGlobal(
    'navigator',
    Object.assign(Object.create(navigator), {
      locks: {
        request: requestLock,
      },
    }),
  )
  store = createAppStore()
  localStorageAdapter.set(cartKey, payment.items)
  store.dispatch(cartRestored(payment.items))
  fetchMock = vi
    .fn<typeof fetch>()
    .mockImplementation(() => Promise.resolve(json(session())))
  requests = []
  const client = ky.create({
    prefix: 'https://bookshop.test/api',
    retry: 0,
    fetch: (input, options) => {
      requests.push(input.clone())

      return fetchMock(input, options)
    },
  })
  vi.spyOn(privateApi, 'authRequest').mockImplementation(client)
  vi.spyOn(publicApi, 'baseRequest').mockImplementation(client)
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  sessionStorage.clear()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('checkout coordinator', () => {
  it('stores only the safe ID and keeps Stripe credentials in memory', async () => {
    await expect(store.dispatch(startCheckout(payment))).resolves.toEqual({
      type: 'ready',
      payment: session(),
    })

    expect(store.getState().payment).toMatchObject({
      phase: 'ready',
      operationId: null,
      payment: session(),
    })
    expect(getCheckoutPaymentId()).toBe('pi_test')
    expect(Object.values(sessionStorage).join('')).not.toContain('_secret')
    expect(Object.values(localStorage).join('')).not.toContain('_secret')
    expect(localStorageAdapter.get(paymentIdempotencyKey)).toBeNull()
    const request = requests[0]!
    expect(request.credentials).toBe('include')
    expect(await request.json()).toEqual(payment)
    expect(request.headers.get('Idempotency-Key')).toBeTruthy()
    expect(store.getState().bookshopApi.mutations).toEqual({})
  })

  it.each([
    {
      name: 'a missing payment token',
      response: { ...session(), paymentToken: '' },
    },
    { name: 'a numeric payment ID', response: { ...session(), paymentId: 7 } },
    { name: 'a numeric token', response: { ...session(), paymentToken: 7 } },
    { name: 'a string amount', response: { ...session(), amount: '1200' } },
    { name: 'fractional cents', response: { ...session(), amount: 1200.5 } },
    { name: 'zero cents', response: { ...session(), amount: 0 } },
    {
      name: 'an unsafe amount',
      response: { ...session(), amount: Number.MAX_SAFE_INTEGER + 1 },
    },
  ])(
    'rejects a checkout response with $name without persisting it',
    async ({ response }) => {
      fetchMock.mockResolvedValueOnce(json(response))

      await expect(
        store.dispatch(startCheckout(payment)),
      ).rejects.toMatchObject({
        code: HttpErrorCode.UnknownResponse,
      })

      expect(store.getState().payment).toMatchObject({
        phase: 'failed',
        payment: null,
      })
      expect(getCheckoutPaymentId()).toBeNull()
      expect(Object.values(sessionStorage).join('')).not.toContain('_secret')
    },
  )

  it('reuses an existing checkout without creating another intent', async () => {
    store.dispatch(recoverCheckout('pi_existing'))

    await expect(store.dispatch(startCheckout(payment))).resolves.toEqual({
      type: 'existing',
      paymentId: 'pi_existing',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts equal basket intent regardless of stored field order', async () => {
    localStorageAdapter.set(cartKey, [{ quantity: 1, id: 7 }])

    await expect(store.dispatch(startCheckout(payment))).resolves.toEqual({
      type: 'ready',
      payment: session(),
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('preserves the same retry key after a network failure', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Offline'))
    await expect(store.dispatch(startCheckout(payment))).rejects.toMatchObject({
      code: HttpErrorCode.UnknownResponse,
    })
    const first = (fetchMock.mock.calls[0]![0] as Request).headers.get(
      'Idempotency-Key',
    )

    await store.dispatch(startCheckout(payment))

    expect(
      (fetchMock.mock.calls[1]![0] as Request).headers.get('Idempotency-Key'),
    ).toBe(first)
  })

  it('reuses the same checkout in a second tab with empty session storage', async () => {
    await store.dispatch(startCheckout(payment))
    sessionStorage.clear()
    const secondTab = createAppStore()

    await expect(secondTab.dispatch(startCheckout(payment))).resolves.toEqual({
      type: 'existing',
      paymentId: 'pi_test',
    })
    fetchMock.mockResolvedValueOnce(json(intent()))
    await secondTab.dispatch(restoreCheckout('pi_test'))

    expect(
      requests.filter((request) => request.method === 'POST'),
    ).toHaveLength(1)
    expect(secondTab.getState().payment.payment).toEqual(session())
    secondTab.dispatch(bookshopApi.util.resetApiState())
  })

  it('shares one retry key and accepts the same payment from simultaneous tab starts', async () => {
    const secondTab = createAppStore()
    const firstResponse = deferredResponse()
    const secondResponse = deferredResponse()
    fetchMock
      .mockReturnValueOnce(firstResponse.promise)
      .mockReturnValueOnce(secondResponse.promise)

    const first = store.dispatch(startCheckout(payment))
    const second = secondTab.dispatch(startCheckout(payment))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    expect(requestLock).toHaveBeenCalledTimes(2)
    const firstKey = requests[0]!.headers.get('Idempotency-Key')
    expect(firstKey).toBeTruthy()
    expect(requests[1]!.headers.get('Idempotency-Key')).toBe(firstKey)

    firstResponse.resolve(json(session()))
    await expect(first).resolves.toMatchObject({ type: 'ready' })
    secondResponse.resolve(json(session()))
    await expect(second).resolves.toMatchObject({ type: 'ready' })
    expect(secondTab.getState().payment.payment).toEqual(
      store.getState().payment.payment,
    )
    expect(Object.values(localStorage).join('')).not.toContain('_secret')
    secondTab.dispatch(bookshopApi.util.resetApiState())
  })

  it('discards a create if another tab resets its shared retry key before the response', async () => {
    const response = deferredResponse()
    fetchMock.mockReturnValueOnce(response.promise)
    const pending = store.dispatch(startCheckout(payment))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    createAppStore().dispatch(resetCheckout())
    response.resolve(json(session()))

    await expect(pending).resolves.toEqual({ type: 'stale' })
    expect(getCheckoutPaymentId()).toBeNull()
    expect(store.getState().payment.phase).toBe('idle')
  })

  it('does not create another payment from a stale basket after another tab paid', async () => {
    localStorageAdapter.remove(cartKey)

    await expect(store.dispatch(startCheckout(payment))).resolves.toEqual({
      type: 'stale',
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(store.getState().cart.cartItems).toEqual([])
    expect(getCheckoutPaymentId()).toBeNull()
  })

  it('discards a create after another tab edits the basket before storage events arrive', async () => {
    const response = deferredResponse()
    fetchMock.mockReturnValueOnce(response.promise)
    const pending = store.dispatch(startCheckout(payment))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    localStorageAdapter.set(cartKey, [{ id: 7, quantity: 2 }])
    response.resolve(json(session()))

    await expect(pending).resolves.toEqual({ type: 'stale' })
    expect(getCheckoutPaymentId()).toBeNull()
    expect(store.getState().payment.phase).toBe('idle')
  })

  it.each(['changed request', 'reset', 'ended'] as const)(
    'rotates the retry key after %s',
    async (reason) => {
      fetchMock.mockResolvedValueOnce(
        json(
          { code: PaymentErrorCode.CheckoutEnded },
          reason === 'ended' ? 410 : 503,
        ),
      )
      await expect(
        store.dispatch(startCheckout(payment)),
      ).rejects.toBeInstanceOf(Error)
      const first = (fetchMock.mock.calls[0]![0] as Request).headers.get(
        'Idempotency-Key',
      )

      if (reason === 'reset') {
        store.dispatch(resetCheckout())
      }

      await store.dispatch(
        startCheckout(
          reason === 'changed request'
            ? { ...payment, expectedTotal: 13 }
            : payment,
        ),
      )

      expect(
        (fetchMock.mock.calls[1]![0] as Request).headers.get('Idempotency-Key'),
      ).not.toBe(first)
    },
  )

  it.each(['success', 'network failure', 'ended'] as const)(
    'ignores an old create %s while a newer attempt is pending',
    async (outcome) => {
      const old = deferredResponse()
      const latest = deferredResponse()
      fetchMock
        .mockReturnValueOnce(old.promise)
        .mockReturnValueOnce(latest.promise)
      const first = store.dispatch(startCheckout(payment))
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
      store.dispatch(resetCheckout())
      const second = store.dispatch(
        startCheckout({ ...payment, expectedTotal: 13 }),
      )
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
      const latestKey = localStorageAdapter.get(paymentIdempotencyKey)

      old.resolve(
        outcome === 'success'
          ? json(session('pi_old'))
          : json(
              { code: PaymentErrorCode.CheckoutEnded },
              outcome === 'ended' ? 410 : 503,
            ),
      )

      await expect(first).resolves.toEqual({ type: 'stale' })
      expect(store.getState().payment.phase).toBe('creating')
      expect(localStorageAdapter.get(paymentIdempotencyKey)).toEqual(latestKey)
      expect(getCheckoutPaymentId()).toBeNull()

      latest.resolve(json(session('pi_new')))
      await second
      expect(getCheckoutPaymentId()).toBe('pi_new')
    },
  )

  it('ignores an old success after the newer checkout completed', async () => {
    const old = deferredResponse()
    fetchMock
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(json(session('pi_new')))
    const first = store.dispatch(startCheckout(payment))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    store.dispatch(resetCheckout())
    await store.dispatch(startCheckout(payment))
    old.resolve(json(session('pi_old')))

    await expect(first).resolves.toEqual({ type: 'stale' })
    expect(getCheckoutPaymentId()).toBe('pi_new')
    expect(store.getState().payment.payment?.paymentId).toBe('pi_new')
  })

  it('does not resurrect checkout after the basket is cleared', async () => {
    store.dispatch(cartAdd({ id: 7 }))
    const old = deferredResponse()
    fetchMock.mockReturnValueOnce(old.promise)
    const pending = store.dispatch(startCheckout(payment))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    store.dispatch(cartClear())
    old.resolve(json(session()))

    await expect(pending).resolves.toEqual({ type: 'stale' })
    expect(getCheckoutPaymentId()).toBeNull()
    expect(store.getState().payment.phase).toBe('idle')
  })

  it('keeps the retry key when an overlapping identical create fails after an older success', async () => {
    const old = deferredResponse()
    const latest = deferredResponse()
    fetchMock
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(latest.promise)
    const first = store.dispatch(startCheckout(payment))
    const second = store
      .dispatch(startCheckout(payment))
      .catch((error: unknown) => error)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const key = (fetchMock.mock.calls[0]![0] as Request).headers.get(
      'Idempotency-Key',
    )
    expect(
      (fetchMock.mock.calls[1]![0] as Request).headers.get('Idempotency-Key'),
    ).toBe(key)
    old.resolve(json(session('pi_old')))
    await expect(first).resolves.toEqual({ type: 'stale' })
    latest.resolve(json({}, 503))
    expect(await second).toBeInstanceOf(Error)

    await store.dispatch(startCheckout(payment))
    expect(
      (fetchMock.mock.calls[2]![0] as Request).headers.get('Idempotency-Key'),
    ).toBe(key)
  })

  it('refreshes prices only for price conflicts and preserves basket edits during recovery', async () => {
    store.dispatch(cartAdd({ id: 7 }))
    await store.dispatch(
      booksApi.util.upsertQueryData('book', 7, {
        id: 7,
        title: 'Old',
        author: null,
        genre: '',
        imgUrl: '',
        description: '',
        publishYear: 2026,
        rating: 5,
        price: 12,
        discount: 0,
        discountPrice: 12,
        topSellers: false,
        newRelease: false,
      }),
    )
    const book = deferredResponse()
    fetchMock
      .mockResolvedValueOnce(
        json({ code: PaymentErrorCode.PriceConflict }, 409),
      )
      .mockReturnValueOnce(book.promise)
    const pending = store
      .dispatch(startCheckout(payment))
      .catch((error: unknown) => error)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    store.dispatch(cartQuantitySet({ cartItem: { id: 7 }, newQuantity: 3 }))
    book.resolve(json({ id: 7, price: 15, discountPrice: 15 }))

    expect(await pending).toEqual({ type: 'stale' })
    expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 3 }])
    expect(
      booksApi.endpoints.book.select(7)(store.getState()).data?.price,
    ).toBe(15)
  })

  it('reports a price conflict after refreshing without automatically retrying payment', async () => {
    store.dispatch(cartAdd({ id: 7 }))
    fetchMock
      .mockResolvedValueOnce(
        json({ code: PaymentErrorCode.PriceConflict }, 409),
      )
      .mockResolvedValueOnce(json({ id: 7, price: 15 }))

    await expect(store.dispatch(startCheckout(payment))).rejects.toMatchObject({
      code: PaymentErrorCode.PriceConflict,
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(store.getState().payment).toMatchObject({
      phase: 'failed',
      error: { code: PaymentErrorCode.PriceConflict },
    })
    expect(getCheckoutPaymentId()).toBeNull()
  })

  it('does not refresh prices for unrelated 409 errors', async () => {
    store.dispatch(cartAdd({ id: 7 }))
    fetchMock.mockResolvedValueOnce(
      json({ code: HttpErrorCode.BadRequest }, 409),
    )

    await expect(store.dispatch(startCheckout(payment))).rejects.toMatchObject({
      code: HttpErrorCode.BadRequest,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('restores a guest checkout through the payment query', async () => {
    store.dispatch(recoverCheckout('pi_test'))
    fetchMock.mockResolvedValueOnce(json(intent()))

    await expect(
      store.dispatch(restoreCheckout('pi_test')),
    ).resolves.toMatchObject({ type: 'ready', payment: session() })

    expect(store.getState().payment.payment).toEqual(session())
    expect((fetchMock.mock.calls[0]![0] as Request).credentials).toBe('include')
  })

  it.each([401, 403, 404, 410])(
    'clears unavailable restored checkout for HTTP %s',
    async (status) => {
      store.dispatch(recoverCheckout('pi_test'))
      fetchMock.mockResolvedValueOnce(
        json({ code: PaymentErrorCode.AccessDenied }, status),
      )

      await expect(store.dispatch(restoreCheckout('pi_test'))).resolves.toEqual(
        { type: 'cleared' },
      )
      expect(getCheckoutPaymentId()).toBeNull()
      expect(store.getState().payment.phase).toBe('idle')
    },
  )

  it.each([500, 503])(
    'keeps the safe ID after a transient HTTP %s failure',
    async (status) => {
      store.dispatch(recoverCheckout('pi_test'))
      fetchMock.mockResolvedValueOnce(
        json({ code: HttpErrorCode.Internal }, status),
      )

      await expect(
        store.dispatch(restoreCheckout('pi_test')),
      ).rejects.toMatchObject({ code: HttpErrorCode.Internal })
      expect(getCheckoutPaymentId()).toBe('pi_test')
      expect(store.getState().payment.phase).toBe('failed')
    },
  )

  it('clears a canceled payment even when Stripe has removed its client secret', async () => {
    store.dispatch(recoverCheckout('pi_test'))
    fetchMock.mockResolvedValueOnce(
      json({ ...intent('pi_test', 'canceled'), client_secret: null }),
    )

    await expect(store.dispatch(restoreCheckout('pi_test'))).resolves.toEqual({
      type: 'cleared',
    })
    expect(getCheckoutPaymentId()).toBeNull()
  })

  it('uses the returned payment ID over the old checkout and retry key', () => {
    store.dispatch(recoverCheckout('pi_old'))
    localStorageAdapter.set(paymentIdempotencyKey, {
      fingerprint: 'old',
      clientIdempotencyKey: 'old',
    })

    expect(store.dispatch(recoverCheckout('pi_new'))).toBe('pi_new')
    expect(localStorageAdapter.get(paymentIdempotencyKey)).toBeNull()
    expect(store.getState().payment.phase).toBe('idle')
  })

  it('keeps the newer checkout when an old cancel response arrives', async () => {
    store.dispatch(recoverCheckout('pi_old'))
    const old = deferredResponse()
    fetchMock.mockReturnValueOnce(old.promise)
    const pending = store.dispatch(cancelCheckout('pi_old'))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    store.dispatch(recoverCheckout('pi_new'))
    old.resolve(json({}))

    await expect(pending).resolves.toEqual({ type: 'stale' })
    expect(getCheckoutPaymentId()).toBe('pi_new')
  })

  it('cancels the active checkout and clears its state and safe ID', async () => {
    store.dispatch(recoverCheckout('pi_test'))

    await expect(store.dispatch(cancelCheckout('pi_test'))).resolves.toEqual({
      type: 'cleared',
    })
    expect(getCheckoutPaymentId()).toBeNull()
    expect(store.getState().payment.phase).toBe('idle')
  })

  it('ignores a restore response after reset or a new create', async () => {
    store.dispatch(recoverCheckout('pi_old'))
    const old = deferredResponse()
    fetchMock.mockReturnValueOnce(old.promise)
    const pending = store.dispatch(restoreCheckout('pi_old'))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    store.dispatch(resetCheckout())
    await store.dispatch(startCheckout(payment))
    old.resolve(json(intent('pi_old')))

    await expect(pending).resolves.toEqual({ type: 'stale' })
    expect(getCheckoutPaymentId()).toBe('pi_test')
  })

  it('lets only the latest restore commit when two callers share an ID', async () => {
    store.dispatch(recoverCheckout('pi_test'))
    const old = deferredResponse()
    fetchMock
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(json(intent()))
    const first = store.dispatch(restoreCheckout('pi_test'))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const second = store.dispatch(restoreCheckout('pi_test'))
    old.resolve(json(intent()))

    await expect(first).resolves.toEqual({ type: 'stale' })
    await expect(second).resolves.toMatchObject({ type: 'ready' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(store.getState().payment.phase).toBe('ready')
  })

  it('aborts a restore without losing the safe ID or committing a late response', async () => {
    store.dispatch(recoverCheckout('pi_test'))
    const old = deferredResponse()
    fetchMock.mockReturnValueOnce(old.promise)
    const controller = new AbortController()
    const pending = store
      .dispatch(restoreCheckout('pi_test', { signal: controller.signal }))
      .catch((error: unknown) => error)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    controller.abort()
    expect(await pending).toMatchObject({ name: 'AbortError' })
    old.resolve(json(intent()))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect((fetchMock.mock.calls[0]![0] as Request).signal.aborted).toBe(true)
    expect(store.getState().payment.phase).toBe('idle')
    expect(getCheckoutPaymentId()).toBe('pi_test')
  })

  it('reuses matching ready state on a Stripe return, but respects an aborted navigation', async () => {
    await store.dispatch(startCheckout(payment))
    await expect(
      store.dispatch(restoreCheckout('pi_test', { reuseExisting: true })),
    ).resolves.toMatchObject({ type: 'ready' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const controller = new AbortController()
    controller.abort()

    await expect(
      store.dispatch(
        restoreCheckout('pi_test', {
          reuseExisting: true,
          signal: controller.signal,
        }),
      ),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('checkout synchronization across tabs', () => {
  let stop: () => void

  const storageEvent = (key: string | null, storageArea = localStorage) => {
    window.dispatchEvent(new StorageEvent('storage', { key, storageArea }))
  }

  beforeEach(() => {
    store.dispatch(recoverCheckout('pi_shared'))
    store.dispatch(checkoutReady(session('pi_shared')))
    stop = listenForCheckoutChanges(store)
  })

  afterEach(() => {
    stop()
  })

  it('clears the paid basket and obsolete payment form when another tab finishes', () => {
    const secondTab = createAppStore()
    secondTab.dispatch(resetCheckout())
    localStorageAdapter.remove(cartKey)

    storageEvent(paymentIdKey)
    storageEvent(cartKey)

    expect(store.getState().cart.cartItems).toEqual([])
    expect(store.getState().payment.payment).toBeNull()
    expect(store.getState().payment.phase).toBe('superseded')
  })

  it('discards a superseded session without deleting the other tab checkout', () => {
    localStorageAdapter.set(paymentIdKey, 'pi_new')
    localStorageAdapter.set(cartKey, [{ id: 7, quantity: 2 }])
    storageEvent(paymentIdKey)

    expect(store.getState().payment.payment).toBeNull()
    expect(localStorageAdapter.get(paymentIdKey)).toBe('pi_new')
    expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 2 }])
  })

  it('reads the latest storage when an older event is delivered', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: paymentIdKey,
        oldValue: 'pi_shared',
        newValue: 'pi_old',
        storageArea: localStorage,
      }),
    )

    expect(store.getState().payment.payment?.paymentId).toBe('pi_shared')
  })

  it('keeps equal basket intent without replacing Redux state', () => {
    const cartItems = store.getState().cart.cartItems
    localStorageAdapter.set(cartKey, [{ quantity: 1, id: 7 }])

    storageEvent(cartKey)

    expect(store.getState().cart.cartItems).toBe(cartItems)
  })

  it.each(['focus', 'pageshow', 'visibilitychange'])(
    'synchronizes a background tab on %s without a storage event',
    (event) => {
      localStorageAdapter.remove(paymentIdKey)
      localStorageAdapter.remove(cartKey)
      const target = event === 'visibilitychange' ? document : window
      target.dispatchEvent(new Event(event))

      expect(store.getState().payment.payment).toBeNull()
      expect(store.getState().cart.cartItems).toEqual([])
    },
  )

  it('ignores unrelated storage and removes listeners on cleanup', () => {
    localStorageAdapter.remove(paymentIdKey)
    sessionStorageAdapter.set(paymentIdKey, 'pi_other')
    storageEvent('language')
    storageEvent(paymentIdempotencyKey)
    storageEvent(paymentIdKey, sessionStorage)
    expect(store.getState().payment.payment?.paymentId).toBe('pi_shared')

    stop()
    storageEvent(paymentIdKey)
    expect(store.getState().payment.payment?.paymentId).toBe('pi_shared')
  })
})
