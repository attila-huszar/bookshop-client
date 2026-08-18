import ky, { HTTPError } from 'ky'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as paymentsApi from '@/api/payments'
import { log } from '@/services'
import * as errorsModule from '@/errors'
import { paymentCreate } from './payment'

afterEach(() => {
  vi.restoreAllMocks()
})

const createHttpErrorWithStatus = async (
  status: number,
): Promise<HTTPError> => {
  const mockFetch: typeof fetch = () =>
    Promise.resolve(
      new Response(JSON.stringify({ error: 'mock error' }), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    )

  try {
    await ky.get('https://bookshop.test/api/payments', {
      fetch: mockFetch,
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
  it('maps HTTP 409 errors to price_conflict reject payload', async () => {
    const conflictError = await createHttpErrorWithStatus(409)

    vi.spyOn(paymentsApi, 'postPaymentIntent').mockRejectedValue(conflictError)
    vi.spyOn(errorsModule, 'handleError').mockReturnValue(
      new Error('Prices changed in your cart'),
    )
    const logErrorSpy = vi.spyOn(log, 'error')

    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.type).toBe('payment/paymentCreate/rejected')
    expect(action.payload).toEqual({
      code: 'price_conflict',
      message: 'Prices changed in your cart',
    })
    expect(logErrorSpy).not.toHaveBeenCalled()
  })

  it('maps non-409 failures to unknown reject payload', async () => {
    const genericError = new Error('Network issue')

    vi.spyOn(paymentsApi, 'postPaymentIntent').mockRejectedValue(genericError)
    vi.spyOn(errorsModule, 'handleError').mockReturnValue(
      new Error('Order creation failed fallback'),
    )
    const logErrorSpy = vi.spyOn(log, 'error')

    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.type).toBe('payment/paymentCreate/rejected')
    expect(action.payload).toEqual({
      code: 'unknown',
      message: 'Order creation failed fallback',
    })
    expect(logErrorSpy).toHaveBeenCalledTimes(1)
    expect(logErrorSpy).toHaveBeenCalledWith('Order creation failed fallback', {
      error: genericError,
    })
  })
})
