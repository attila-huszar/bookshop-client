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

beforeEach(() => {
  vi.useFakeTimers()
  retrievePaymentIntent.mockReset()
  vi.mocked(useStripe).mockReturnValue({
    retrievePaymentIntent,
  } as unknown as ReturnType<typeof useStripe>)
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('Payment status polling', () => {
  it('stops polling and clears its timers once processing finishes', async () => {
    retrievePaymentIntent
      .mockResolvedValueOnce(retrieved('processing'))
      .mockResolvedValueOnce(retrieved('succeeded'))
    const { result } = renderHook(() => usePaymentStatus('secret'))

    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.status.intent).toBe('processing')

    await act(() => vi.advanceTimersByTimeAsync(5000))
    expect(result.current.status.intent).toBe('succeeded')
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
    expect(result.current.status.intent).toBe('succeeded')

    rerender(undefined)
    expect(result.current.status.intent).toBe('succeeded')
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)

    rerender('second-secret')
    expect(result.current.status).toEqual({
      intent: null,
      messageOverride: null,
    })
    expect(retrievePaymentIntent).toHaveBeenLastCalledWith('second-secret')
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
    expect(result.current.status.intent).toBe('processing')

    await act(async () => {
      finishOldPayment?.(retrieved('succeeded'))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result.current.status.intent).toBe('processing')
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
    expect(result.current.status.messageOverride?.type).toBe('timeout')
    expect(vi.getTimerCount()).toBe(0)

    await act(async () => {
      finishTimedOutPayment?.(retrieved('requires_payment_method'))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result.current.status.messageOverride?.type).toBe('timeout')

    act(() => result.current.retry())
    expect(result.current.status).toEqual({
      intent: null,
      messageOverride: null,
    })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.status.intent).toBe('succeeded')
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

    await act(async () => {
      await i18n.changeLanguage('hu')
    })
    rerender()
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(retrievePaymentIntent).toHaveBeenCalledTimes(3)
    expect(result.current.status.messageOverride).toEqual({
      type: 'failure',
      details: '',
    })
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
    expect(result.current.status.messageOverride).toEqual({
      type: 'timeout',
      timeoutSeconds: 30,
    })
  })
})
