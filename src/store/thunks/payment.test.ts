import { i18n } from '@/i18n'
import ky, { HTTPError } from 'ky'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as paymentsApi from '@/api/payments'
import { log } from '@/services/logger'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { paymentIdempotencyKey } from '@/constants/keys'
import { paymentCreate, paymentRetrieve } from './payment'

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.removeItem(paymentIdempotencyKey)
})

const createHttpErrorWithStatus = async (
  status: number,
  code = 'BAD_REQUEST',
): Promise<HTTPError> => {
  const mockFetch: typeof fetch = () =>
    Promise.resolve(
      new Response(JSON.stringify({ code }), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    )

  try {
    await ky.get('https://bookshop.test/api/payments', {
      fetch: mockFetch,
      retry: 0,
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      return error
    }

    throw error
  }

  throw new Error('Expected ky to throw HTTPError')
}

describe('payment thunk - paymentCreate', () => {
  it('rotates the request key only after the server says the checkout was canceled', async () => {
    const request = { items: [{ id: 1, quantity: 1 }], expectedTotal: 12 }
    const post = vi
      .spyOn(paymentsApi, 'postPaymentIntent')
      .mockRejectedValueOnce(await createHttpErrorWithStatus(410))
      .mockRejectedValueOnce(new Error('Network failure'))
    await paymentCreate(request)(vi.fn(), vi.fn(), undefined)
    await paymentCreate(request)(vi.fn(), vi.fn(), undefined)
    expect(post.mock.calls[0]?.[1]).not.toBe(post.mock.calls[1]?.[1])
  })
  it('maps PRICE_CONFLICT to price_conflict reject payload', async () => {
    const conflictError = await createHttpErrorWithStatus(409, 'PRICE_CONFLICT')

    vi.spyOn(paymentsApi, 'postPaymentIntent').mockRejectedValue(conflictError)
    const logErrorSpy = vi.spyOn(log, 'error')

    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.type).toBe('payment/paymentCreate/rejected')
    expect(action.payload).toEqual({
      code: 'price_conflict',
      message: i18n.t('checkout.priceChanged'),
      apiError: { code: 'PRICE_CONFLICT' },
    })
    expect(logErrorSpy).not.toHaveBeenCalled()
  })

  it('does not trigger cart price recovery for other conflicts', async () => {
    vi.spyOn(paymentsApi, 'postPaymentIntent').mockRejectedValue(
      await createHttpErrorWithStatus(409, 'TERMS_NOT_RECORDED'),
    )
    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.payload).toMatchObject({
      code: 'unknown',
      apiError: { code: 'TERMS_NOT_RECORDED' },
    })
  })

  it('maps non-conflict failures to unknown reject payload', async () => {
    const genericError = new TypeError('Failed to fetch')

    vi.spyOn(paymentsApi, 'postPaymentIntent').mockRejectedValue(genericError)
    const logErrorSpy = vi.spyOn(log, 'error')

    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.type).toBe('payment/paymentCreate/rejected')
    expect(action.payload).toEqual({
      code: 'unknown',
      message: i18n.t('checkout.createError'),
    })
    expect(logErrorSpy).not.toHaveBeenCalled()
  })

  it('reuses the same idempotency key for a retry of the same payment request', async () => {
    const request = {
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    }
    const postPaymentIntentSpy = vi
      .spyOn(paymentsApi, 'postPaymentIntent')
      .mockRejectedValue(new Error('Network issue'))

    await paymentCreate(request)(vi.fn(), vi.fn(), undefined)
    await paymentCreate(request)(vi.fn(), vi.fn(), undefined)

    expect(postPaymentIntentSpy).toHaveBeenCalledTimes(2)
    expect(postPaymentIntentSpy.mock.calls[0]?.[1]).toBe(
      postPaymentIntentSpy.mock.calls[1]?.[1],
    )
    expect(sessionStorageAdapter.get(paymentIdempotencyKey)).toEqual({
      fingerprint: JSON.stringify(request),
      clientIdempotencyKey: postPaymentIntentSpy.mock.calls[0]?.[1],
    })
  })
})

describe('payment thunk - paymentRetrieve', () => {
  it.each([401, 403, 404, 410])(
    'marks HTTP %s as an unavailable session',
    async (status) => {
      vi.spyOn(paymentsApi, 'getPaymentIntent').mockRejectedValue(
        await createHttpErrorWithStatus(status),
      )
      const action = await paymentRetrieve({ paymentId: 'pi_guest' })(
        vi.fn(),
        vi.fn(),
        undefined,
      )
      expect(action.payload).toMatchObject({ code: 'session_unavailable' })
    },
  )

  it.each([500, 503])(
    'does not invalidate a session on HTTP %s',
    async (status) => {
      vi.spyOn(paymentsApi, 'getPaymentIntent').mockRejectedValue(
        await createHttpErrorWithStatus(status),
      )
      const action = await paymentRetrieve({ paymentId: 'pi_guest' })(
        vi.fn(),
        vi.fn(),
        undefined,
      )
      expect(action.type).toBe('payment/paymentRetrieve/rejected')
      expect(action.payload).toBeUndefined()
    },
  )

  it('recognizes canceled payments even when Stripe no longer returns a payment token', async () => {
    vi.spyOn(paymentsApi, 'getPaymentIntent').mockResolvedValue({
      id: 'pi_guest',
      status: 'canceled',
      client_secret: null,
      amount: 1200,
      currency: 'usd',
      receipt_email: null,
      shipping: null,
      created: 1,
    })
    const action = await paymentRetrieve({ paymentId: 'pi_guest' })(
      vi.fn(),
      vi.fn(),
      undefined,
    )
    expect(action.payload).toMatchObject({ code: 'session_unavailable' })
  })

  it('retrieves an accessible guest payment without a logged-in account', async () => {
    vi.spyOn(paymentsApi, 'getPaymentIntent').mockResolvedValue({
      id: 'pi_guest',
      status: 'requires_payment_method',
      client_secret: 'test_token',
      amount: 1200,
      currency: 'usd',
      receipt_email: null,
      shipping: null,
      created: 1,
    })
    const action = await paymentRetrieve({ paymentId: 'pi_guest' })(
      vi.fn(),
      vi.fn(),
      undefined,
    )
    expect(action.type).toBe('payment/paymentRetrieve/fulfilled')
  })
})
