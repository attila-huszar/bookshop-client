import { vi } from 'vitest'
import { ROUTE } from '@/routes'
import { paymentIdKey } from '@/constants'
import { checkoutLoader } from './checkoutLoader'

const {
  mockAuthLoader,
  mockPaymentRetrieve,
  mockSessionStorageGet,
  mockSessionStorageSet,
  mockSessionStorageRemove,
  mockStoreGetState,
  mockStoreDispatch,
} = vi.hoisted(() => ({
  mockAuthLoader: vi.fn(),
  mockPaymentRetrieve: vi.fn(),
  mockSessionStorageGet: vi.fn(),
  mockSessionStorageSet: vi.fn(),
  mockSessionStorageRemove: vi.fn(),
  mockStoreGetState: vi.fn(),
  mockStoreDispatch: vi.fn(),
}))

vi.mock('./authLoader', () => ({
  authLoader: mockAuthLoader,
}))

vi.mock('@/helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers')>()

  return {
    ...actual,
    sessionStorageAdapter: {
      get: mockSessionStorageGet,
      set: mockSessionStorageSet,
      remove: mockSessionStorageRemove,
    },
  }
})

vi.mock('@/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store')>()

  return {
    ...actual,
    paymentRetrieve: mockPaymentRetrieve,
    store: {
      getState: mockStoreGetState,
      dispatch: mockStoreDispatch,
    },
  }
})

const getResponseLocation = (response: unknown): string | null =>
  response instanceof Response ? response.headers.get('Location') : null

describe('checkoutLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorageGet.mockReturnValue('pi_test_payment')
    mockAuthLoader.mockResolvedValue(true)
    mockStoreGetState.mockReturnValue({ payment: { payment: null } })
    mockPaymentRetrieve.mockReturnValue({ type: 'payment/retrieve' })
    mockStoreDispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        paymentId: 'pi_test_payment',
        paymentToken: 'pi_token',
        status: 'requires_payment_method',
        amount: 1500,
      }),
    })
  })

  it('redirects home when payment session key is missing', async () => {
    mockSessionStorageGet.mockReturnValue(null)

    const result = await checkoutLoader({
      request: new Request('http://localhost/checkout'),
    })

    expect(getResponseLocation(result)).toBe(ROUTE.HOME)
    expect(mockAuthLoader).not.toHaveBeenCalled()
  })

  it('sanitizes Stripe return params from URL', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    const result = await checkoutLoader({
      request: new Request(
        'http://localhost/checkout?payment_intent=pi_123&payment_intent_client_secret=secret_123&redirect_status=succeeded',
      ),
    })

    expect(getResponseLocation(result)).toBe(
      '/checkout?redirect_status=succeeded',
    )
    expect(replaceStateSpy).toHaveBeenCalled()
    expect(replaceStateSpy.mock.calls.at(-1)?.[2]).toBe(
      '/checkout?redirect_status=succeeded',
    )
    expect(mockAuthLoader).not.toHaveBeenCalled()
  })

  it('redirects to status flow when retrieved payment is already successful', async () => {
    mockStoreGetState.mockReturnValue({
      payment: {
        payment: {
          paymentId: 'pi_test_payment',
          paymentToken: 'pi_token',
          amount: 1500,
        },
      },
    })
    mockStoreDispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        paymentId: 'pi_test_payment',
        paymentToken: 'pi_token',
        status: 'succeeded',
        amount: 1500,
      }),
    })

    const result = await checkoutLoader({
      request: new Request('http://localhost/checkout'),
    })

    expect(mockPaymentRetrieve).toHaveBeenCalledWith({
      paymentId: 'pi_test_payment',
      allowSucceeded: true,
    })
    expect(getResponseLocation(result)).toBe(
      '/checkout?redirect_status=succeeded',
    )
    expect(mockSessionStorageRemove).not.toHaveBeenCalled()
  })

  it('returns null when payment is not successful and no redirect is needed', async () => {
    const result = await checkoutLoader({
      request: new Request('http://localhost/checkout'),
    })

    expect(result).toBeNull()
    expect(mockSessionStorageRemove).not.toHaveBeenCalled()
  })

  it('clears session payment key when payment retrieval fails', async () => {
    mockStoreDispatch.mockReturnValue({
      unwrap: vi
        .fn()
        .mockRejectedValue(new Error('failed to retrieve payment')),
    })

    const result = await checkoutLoader({
      request: new Request('http://localhost/checkout'),
    })

    expect(mockSessionStorageRemove).toHaveBeenCalledWith(paymentIdKey)
    expect(getResponseLocation(result)).toBe(ROUTE.HOME)
  })

  it('skips retrieval when returning from Stripe and payment token is already in state', async () => {
    mockStoreGetState.mockReturnValue({
      payment: {
        payment: {
          paymentId: 'pi_test_payment',
          paymentToken: 'pi_token',
          amount: 1500,
        },
      },
    })

    const result = await checkoutLoader({
      request: new Request(
        'http://localhost/checkout?redirect_status=succeeded',
      ),
    })

    expect(result).toBeNull()
    expect(mockPaymentRetrieve).not.toHaveBeenCalled()
    expect(mockStoreDispatch).not.toHaveBeenCalled()
  })
})
