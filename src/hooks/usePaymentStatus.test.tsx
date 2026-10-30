import { i18n } from '@/i18n'
import { useStripe } from '@stripe/react-stripe-js'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PaymentIntent, PaymentIntentStatus } from '@/types/Stripe'
import { usePaymentStatus } from './usePaymentStatus'

vi.mock('@stripe/react-stripe-js', () => ({ useStripe: vi.fn() }))

const retrievePaymentIntent =
  vi.fn<NonNullable<ReturnType<typeof useStripe>>['retrievePaymentIntent']>()
type RetrievalResult = Awaited<ReturnType<typeof retrievePaymentIntent>>

const retrieved = (status: PaymentIntentStatus): RetrievalResult => ({
  paymentIntent: { status } as PaymentIntent,
})

const stripe = {
  retrievePaymentIntent,
} as unknown as NonNullable<ReturnType<typeof useStripe>>

beforeEach(() => {
  vi.useFakeTimers()
  retrievePaymentIntent.mockReset()
  vi.mocked(useStripe).mockReturnValue(stripe)
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('Payment status polling', () => {
  it.each([undefined, null, ''])(
    'does not start requests or timers without a payment token (%s)',
    (token) => {
      const { result } = renderHook(() => usePaymentStatus(token))

      expect(result.current.status).toEqual({ type: 'checking' })
      expect(retrievePaymentIntent).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    },
  )

  it('waits for Stripe to become available before starting its polling window', async () => {
    vi.mocked(useStripe).mockReturnValue(null)
    retrievePaymentIntent.mockResolvedValue(retrieved('succeeded'))
    const { result, rerender } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(60000))
    expect(retrievePaymentIntent).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)

    vi.mocked(useStripe).mockReturnValue(stripe)
    rerender()
    await act(() => vi.advanceTimersByTimeAsync(0))

    expect(result.current.status).toEqual({ type: 'succeeded' })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stops polling and clears its timers once processing finishes', async () => {
    retrievePaymentIntent
      .mockResolvedValueOnce(retrieved('processing'))
      .mockResolvedValueOnce(retrieved('succeeded'))
    const { result } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.status.type).toBe('processing')

    await act(() => vi.advanceTimersByTimeAsync(5000))
    expect(result.current.status.type).toBe('succeeded')
    expect(vi.getTimerCount()).toBe(0)

    await act(() => vi.advanceTimersByTimeAsync(30000))
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(2)
  })

  it('keeps the success screen after session cleanup and clears it for a new payment', async () => {
    retrievePaymentIntent
      .mockResolvedValueOnce(retrieved('succeeded'))
      .mockImplementationOnce(() => new Promise(() => undefined))
    const { result, rerender } = renderHook(
      (token: string | undefined) => usePaymentStatus(token),
      { initialProps: 'first-secret' },
    )

    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.status.type).toBe('succeeded')

    rerender(undefined)
    expect(result.current.status.type).toBe('succeeded')
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)

    rerender('second-secret')
    expect(result.current.status).toEqual({
      type: 'checking',
    })
    expect(retrievePaymentIntent).toHaveBeenLastCalledWith('second-secret')
  })

  it('keeps the processing result until the deadline after three unsuccessful checks', async () => {
    retrievePaymentIntent.mockResolvedValue(retrieved('processing'))
    const { result } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(15000))
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(3)
    expect(result.current.status).toEqual({ type: 'processing' })
    expect(vi.getTimerCount()).toBe(1)

    await act(() => vi.advanceTimersByTimeAsync(15000))
    expect(result.current.status).toEqual({
      type: 'timeout',
      timeoutSeconds: 30,
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(3)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('handles Stripe error results with the same bounded retries as rejected requests', async () => {
    retrievePaymentIntent.mockResolvedValue({
      error: { type: 'api_error', message: 'Payment service unavailable' },
    })
    const { result } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(15000))

    expect(result.current.status).toEqual({
      type: 'failure',
      details: 'Payment service unavailable',
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(3)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores an old payment response after switching to another payment', async () => {
    let finishOldPayment: ((result: RetrievalResult) => void) | undefined
    retrievePaymentIntent
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishOldPayment = resolve
          }),
      )
      .mockResolvedValueOnce(retrieved('processing'))
    const { result, rerender } = renderHook(
      (token) => usePaymentStatus(token),
      { initialProps: 'first-secret' },
    )

    rerender('second-secret')
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.status.type).toBe('processing')

    await act(async () => {
      finishOldPayment?.(retrieved('succeeded'))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result.current.status.type).toBe('processing')
  })

  it('ignores a response after timeout and starts a fresh polling window on retry', async () => {
    let finishTimedOutPayment: ((result: RetrievalResult) => void) | undefined
    retrievePaymentIntent
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishTimedOutPayment = resolve
          }),
      )
      .mockResolvedValueOnce(retrieved('succeeded'))
    const { result } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(30000))
    expect(result.current.status.type).toBe('timeout')
    expect(vi.getTimerCount()).toBe(0)

    await act(async () => {
      finishTimedOutPayment?.(retrieved('requires_payment_method'))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result.current.status.type).toBe('timeout')

    act(() => result.current.retry())
    expect(result.current.status).toEqual({
      type: 'checking',
    })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.status.type).toBe('succeeded')
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(2)
  })

  it('cancels pending retries and the deadline on unmount', async () => {
    retrievePaymentIntent.mockResolvedValue(retrieved('processing'))
    const { unmount } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(0))
    unmount()
    expect(vi.getTimerCount()).toBe(0)

    await act(() => vi.advanceTimersByTimeAsync(60000))
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)
  })

  it('preserves its retry schedule across language changes and stores untranslated failure data', async () => {
    retrievePaymentIntent.mockRejectedValue({})
    const { result, rerender } = renderHook(() => usePaymentStatus('secret'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)

    expect(result.current.status).toEqual({
      type: 'retry',
      attempt: 2,
      maxAttempts: 3,
    })

    await act(async () => {
      await i18n.changeLanguage('hu')
    })
    rerender()
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(2)
    expect(result.current.status).toEqual({
      type: 'retry',
      attempt: 3,
      maxAttempts: 3,
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(3)
    expect(result.current.status).toEqual({
      type: 'failure',
      details: '',
    })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps the original absolute timeout after a language change', async () => {
    retrievePaymentIntent.mockImplementation(() => new Promise(() => undefined))
    const { result, rerender } = renderHook(() => usePaymentStatus('secret'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000)
      await i18n.changeLanguage('hu')
    })
    rerender()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)
    expect(result.current.status).toEqual({
      type: 'timeout',
      timeoutSeconds: 30,
    })
  })
})
