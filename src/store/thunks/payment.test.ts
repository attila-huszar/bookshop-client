import ky, { HTTPError } from 'ky'
import { describe, expect, it, vi } from 'vitest'

const postPaymentIntentMock = vi.fn()
const handleErrorMock = vi.fn()

vi.mock('@/api', () => ({
  postPaymentIntent: postPaymentIntentMock,
  getPaymentIntent: vi.fn(),
  deletePaymentIntent: vi.fn(),
  getOrderSyncStatus: vi.fn(),
}))

vi.mock('@/errors', () => ({
  handleError: handleErrorMock,
}))

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

const getPaymentCreate = async () => {
  const module = await import('./payment')
  return module.paymentCreate
}

describe('payment thunk - paymentCreate', () => {
  it('maps HTTP 409 errors to price_conflict reject payload', async () => {
    vi.resetModules()
    const conflictError = await createHttpErrorWithStatus(409)

    postPaymentIntentMock.mockRejectedValue(conflictError)
    handleErrorMock.mockResolvedValue(new Error('Prices changed in your cart'))

    const paymentCreate = await getPaymentCreate()

    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.type).toBe('payment/paymentCreate/rejected')
    expect(action.payload).toEqual({
      code: 'price_conflict',
      message: 'Prices changed in your cart',
    })
  })

  it('maps non-409 failures to unknown reject payload', async () => {
    vi.resetModules()
    const genericError = new Error('Network issue')

    postPaymentIntentMock.mockRejectedValue(genericError)
    handleErrorMock.mockResolvedValue(
      new Error('Order creation failed fallback'),
    )

    const paymentCreate = await getPaymentCreate()

    const action = await paymentCreate({
      items: [{ id: 1, quantity: 2 }],
      expectedTotal: 36,
    })(vi.fn(), vi.fn(), undefined)

    expect(action.type).toBe('payment/paymentCreate/rejected')
    expect(action.payload).toEqual({
      code: 'unknown',
      message: 'Order creation failed fallback',
    })
  })
})
