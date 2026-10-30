import { StrictMode, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAcceptPaymentTermsMutation } from '@/store/api/termsApi'
import type { CheckoutTerms } from '@/types'
import { usePaymentSubmit } from './usePaymentSubmit'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

vi.mock('@stripe/react-stripe-js', () => ({
  useElements: vi.fn(),
  useStripe: vi.fn(),
}))
vi.mock('@/store/api/termsApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/termsApi')>()),
  useAcceptPaymentTermsMutation: vi.fn(),
}))

const terms: CheckoutTerms = {
  url: 'https://bookshop.test/terms-v1.pdf',
  version: 'v1',
  publishedAt: '2026-10-14T10:00:00Z',
  statements: {
    en: 'I have read and accept the Terms and Conditions.',
    hu: 'Elolvastam és elfogadom az Általános Szerződési Feltételeket (ÁSZF).',
  },
}
const input = {
  email: 'guest@example.com',
  paymentId: 'pi_test',
  terms,
  termsAccepted: true,
}
const submitEvent = () =>
  ({ preventDefault: vi.fn() }) as unknown as SubmitEvent<HTMLFormElement>
const confirmPayment = vi.fn<
  (request: { confirmParams: { receipt_email: string } }) => Promise<{
    paymentIntent?: { status: string }
    error?: { type: string; message?: string }
  }>
>()
const acceptTerms = vi.fn()
const unwrap = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  unwrap.mockReset().mockResolvedValue({
    version: terms.version,
    language: 'en',
    statement: 'I have read and accept the Terms and Conditions.',
    acceptedAt: '2026-10-14T10:00:00Z',
  })
  acceptTerms.mockReturnValue({ unwrap })
  confirmPayment
    .mockReset()
    .mockResolvedValue({ paymentIntent: { status: 'succeeded' } })
  vi.mocked(useStripe).mockReturnValue({
    confirmPayment,
  } as unknown as ReturnType<typeof useStripe>)
  vi.mocked(useElements).mockReturnValue({} as ReturnType<typeof useElements>)
  vi.mocked(useNavigate).mockReturnValue(vi.fn())
  vi.mocked(useAcceptPaymentTermsMutation).mockReturnValue([
    acceptTerms,
    {},
  ] as unknown as ReturnType<typeof useAcceptPaymentTermsMutation>)
})

describe('Payment terms submission', () => {
  it('opens the payment status page after a non-redirect confirmation', async () => {
    const navigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    const { result } = renderHook(() => usePaymentSubmit(input), {
      wrapper: StrictMode,
    })

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(navigate).toHaveBeenCalledExactlyOnceWith(
      '/checkout?redirect_status=succeeded',
      { replace: true },
    )
    expect(result.current.isLoading).toBe(false)
  })

  it.each(['Stripe', 'Elements', 'payment session'] as const)(
    'blocks submission when %s is unavailable',
    async (missing) => {
      if (missing === 'Stripe') {
        vi.mocked(useStripe).mockReturnValue(null)
      }

      if (missing === 'Elements') {
        vi.mocked(useElements).mockReturnValue(null)
      }

      const { result } = renderHook(() =>
        usePaymentSubmit({
          ...input,
          paymentId: missing === 'payment session' ? '' : input.paymentId,
        }),
      )

      await act(() => result.current.handleSubmit(submitEvent()))

      expect(result.current.message.text).toBe(i18n.t('checkout.notReady'))
      expect(result.current.isLoading).toBe(false)
      expect(acceptTerms).not.toHaveBeenCalled()
      expect(confirmPayment).not.toHaveBeenCalled()
    },
  )

  it('requires a receipt email before recording acceptance or confirming payment', async () => {
    const { result } = renderHook(() =>
      usePaymentSubmit({ ...input, email: '' }),
    )

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(result.current.message.text).toBe(i18n.t('checkout.missingEmail'))
    expect(acceptTerms).not.toHaveBeenCalled()
    expect(confirmPayment).not.toHaveBeenCalled()
  })

  it('clears retry availability together with the error message', async () => {
    confirmPayment.mockResolvedValueOnce({
      error: { type: 'api_connection_error' },
    })
    const { result } = renderHook(() => usePaymentSubmit(input))
    await act(() => result.current.handleSubmit(submitEvent()))
    expect(result.current.canRetry).toBe(true)

    act(() => {
      result.current.setMessage({ text: null, type: 'neutral' })
    })

    expect(result.current.message.text).toBeNull()
    expect(result.current.canRetry).toBe(false)
    expect(confirmPayment).toHaveBeenCalledTimes(1)
  })

  it.each(['terms acceptance', 'Stripe confirmation'] as const)(
    'does not continue a pending %s after checkout unmounts',
    async (stage) => {
      let finish!: () => void
      const pending = new Promise<void>((resolve) => {
        finish = resolve
      })

      if (stage === 'terms acceptance') {
        unwrap.mockReturnValueOnce(pending)
      } else {
        confirmPayment.mockReturnValueOnce(
          pending.then(() => ({ paymentIntent: { status: 'succeeded' } })),
        )
      }

      const navigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(navigate)
      const { result, unmount } = renderHook(() => usePaymentSubmit(input))
      let submitting: Promise<void>

      await act(async () => {
        submitting = result.current.handleSubmit(submitEvent())
        await Promise.resolve()
      })
      unmount()

      await act(async () => {
        finish()
        await submitting
      })

      expect(confirmPayment).toHaveBeenCalledTimes(
        stage === 'terms acceptance' ? 0 : 1,
      )
      expect(navigate).not.toHaveBeenCalled()
    },
  )

  it('translates a rejected terms acceptance again without confirming payment or resubmitting', async () => {
    unwrap.mockRejectedValueOnce({ code: 'TERMS_CHANGED' })
    const { result } = renderHook(() => usePaymentSubmit(input))
    await act(() => result.current.handleSubmit(submitEvent()))

    expect(result.current.message.text).toBe(i18n.t('errors.termsChanged'))
    expect(result.current.canRetry).toBe(false)

    await act(() => i18n.changeLanguage('hu'))

    expect(result.current.message.text).toBe(i18n.t('errors.termsChanged'))
    expect(acceptTerms).toHaveBeenCalledTimes(1)
    expect(confirmPayment).not.toHaveBeenCalled()
  })

  it.each([
    { code: 'TERMS_CHANGED', status: 412, retry: false },
    { code: 'TERMS_ALREADY_ACCEPTED', status: 412, retry: false },
    { code: 'TERMS_NOT_RECORDED', status: 409, retry: false },
    { code: 'CHECKOUT_ENDED', status: 410, retry: false },
    { code: 'UNAUTHORIZED', status: 401, retry: false },
    { code: 'INTERNAL_ERROR', status: 500, retry: true },
    { code: 'REQUEST_TIMEOUT', status: 408, retry: true },
    { code: 'RATE_LIMITED', status: 429, retry: true },
    { code: 'TERMS_UNAVAILABLE', status: 503, retry: true },
  ])(
    'offers a retry for $code only when the failure is temporary',
    async ({ code, status, retry }) => {
      unwrap.mockRejectedValueOnce({ code, status })
      const { result } = renderHook(() => usePaymentSubmit(input))

      await act(() => result.current.handleSubmit(submitEvent()))

      expect(result.current.canRetry).toBe(retry)
      expect(confirmPayment).not.toHaveBeenCalled()
    },
  )

  it('shows a translated payment-service fallback in Hungarian', async () => {
    await i18n.changeLanguage('hu')
    confirmPayment.mockResolvedValueOnce({
      error: { type: 'api_connection_error' },
    })
    const { result } = renderHook(() => usePaymentSubmit(input))

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(result.current.message.text).toBe(
      'Nem sikerült csatlakozni a fizetési szolgáltatáshoz. Kérjük, ellenőrizze az internetkapcsolatát.',
    )
    expect(result.current.canRetry).toBe(true)
  })

  it.each(['card_error', 'validation_error'])(
    'preserves the Stripe-provided message for %s',
    async (type) => {
      confirmPayment.mockResolvedValueOnce({
        error: { type, message: 'Specific payment details' },
      })
      const { result } = renderHook(() => usePaymentSubmit(input))

      await act(() => result.current.handleSubmit(submitEvent()))

      expect(result.current.message.text).toBe('Specific payment details')
      expect(result.current.canRetry).toBe(false)
    },
  )

  it('uses a translated fallback for an unfamiliar Stripe error without a message', async () => {
    await i18n.changeLanguage('hu')
    confirmPayment.mockResolvedValueOnce({
      error: { type: 'unfamiliar_error' },
    })
    const { result } = renderHook(() => usePaymentSubmit(input))

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(result.current.message.text).toBe(
      'Váratlan hiba történt. Kérjük, próbálja újra.',
    )
  })

  it('blocks submission without explicit acceptance', async () => {
    const { result } = renderHook(() =>
      usePaymentSubmit({ ...input, termsAccepted: false }),
    )

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(result.current.message.text).toMatch(/accept the terms/)
    expect(acceptTerms).not.toHaveBeenCalled()
    expect(confirmPayment).not.toHaveBeenCalled()
  })

  it('blocks payment when no terms document is available', async () => {
    const { result } = renderHook(() =>
      usePaymentSubmit({ ...input, terms: null }),
    )

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(confirmPayment).not.toHaveBeenCalled()
  })

  it('waits for persisted acceptance before confirming with Stripe', async () => {
    let finishAcceptance: (() => void) | undefined
    unwrap.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishAcceptance = resolve
        }),
    )
    const { result } = renderHook(() => usePaymentSubmit(input))
    let submitting: Promise<void>

    act(() => {
      submitting = result.current.handleSubmit(submitEvent())
    })

    expect(acceptTerms).toHaveBeenCalledWith({
      paymentId: 'pi_test',
      version: terms.version,
      accepted: true,
      language: 'en',
    })
    expect(confirmPayment).not.toHaveBeenCalled()

    await act(async () => {
      finishAcceptance?.()
      await submitting
    })

    expect(confirmPayment).toHaveBeenCalledTimes(1)
    expect(confirmPayment.mock.calls[0]?.[0].confirmParams.receipt_email).toBe(
      'guest@example.com',
    )
  })

  it('blocks Stripe when the server rejects or cannot store acceptance', async () => {
    unwrap.mockRejectedValueOnce({
      message: 'The terms have changed.',
      status: 412,
    })
    const { result } = renderHook(() => usePaymentSubmit(input))

    await act(() => result.current.handleSubmit(submitEvent()))

    expect(confirmPayment).not.toHaveBeenCalled()
    expect(result.current.message.text).toBe('The terms have changed.')
    expect(result.current.isLoading).toBe(false)
  })

  it('requires acceptance again if it is unchecked after a retryable Stripe error', async () => {
    confirmPayment.mockResolvedValueOnce({
      error: { type: 'api_connection_error' },
    })
    const { result, rerender } = renderHook(
      (termsAccepted: boolean) => usePaymentSubmit({ ...input, termsAccepted }),
      { initialProps: true },
    )

    await act(() => result.current.handleSubmit(submitEvent()))
    expect(result.current.canRetry).toBe(true)
    rerender(false)
    await act(() => result.current.handleSubmit(submitEvent()))

    expect(confirmPayment).toHaveBeenCalledTimes(1)
    expect(acceptTerms).toHaveBeenCalledTimes(1)
  })

  it('ignores duplicate submissions while acceptance is being saved', async () => {
    let finishAcceptance: (() => void) | undefined
    unwrap.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishAcceptance = resolve
        }),
    )
    const { result } = renderHook(() => usePaymentSubmit(input))
    let submitting: Promise<void>

    act(() => {
      submitting = result.current.handleSubmit(submitEvent())
    })
    await act(() => result.current.handleSubmit(submitEvent()))
    await act(async () => {
      finishAcceptance?.()
      await submitting
    })

    expect(acceptTerms).toHaveBeenCalledTimes(1)
    expect(confirmPayment).toHaveBeenCalledTimes(1)
  })
})
