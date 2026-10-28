import ky from 'ky'
import * as privateApi from '@/api/authRequest'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartAdd, cartClear, cartQuantitySet } from '@/store/slices/cart'
import { createAppStore } from '@/store/store'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { cartKey, paymentIdempotencyKey } from '@/constants/keys'
import type { PaymentIntentResponse } from '@/types'
import { HttpErrorCode, PaymentErrorCode } from '@/types/ApiError'
import {
  cancelCheckout,
  getCheckoutPaymentId,
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

beforeEach(() => {
  sessionStorage.clear()
  localStorage.removeItem(cartKey)
  store = createAppStore()
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
  localStorage.removeItem(cartKey)
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
    expect(sessionStorageAdapter.get(paymentIdempotencyKey)).toBeNull()
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
      const latestKey = sessionStorageAdapter.get(paymentIdempotencyKey)

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
      expect(sessionStorageAdapter.get(paymentIdempotencyKey)).toEqual(
        latestKey,
      )
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
    sessionStorageAdapter.set(paymentIdempotencyKey, {
      fingerprint: 'old',
      clientIdempotencyKey: 'old',
    })

    expect(store.dispatch(recoverCheckout('pi_new'))).toBe('pi_new')
    expect(sessionStorageAdapter.get(paymentIdempotencyKey)).toBeNull()
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
