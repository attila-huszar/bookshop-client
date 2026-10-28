import { StrictMode } from 'react'
import { useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartClear } from '@/store/slices/cart'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import { formatPaymentStatus } from '@/helpers/checkout'
import type { PaymentStatusState } from '@/types/Payment'
import { PaymentStatus } from './PaymentStatus'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

vi.mock('@/hooks/redux', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('@/hooks/usePaymentStatus', () => ({
  usePaymentStatus: vi.fn(),
}))

vi.mock('lottie-react', () => ({
  Lottie: () => <div data-testid="payment-animation" />,
}))

describe('PaymentStatus', () => {
  const dispatch = vi.fn()
  const navigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppDispatch).mockReturnValue(dispatch)
    vi.mocked(useAppSelector).mockReturnValue({
      paymentId: 'pi_test',
      paymentToken: 'secret',
      amount: 1200,
    })
    vi.mocked(useNavigate).mockReturnValue(navigate)
  })

  it('translates successful payment without clearing the session again on language change', async () => {
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'succeeded' },
      retry: vi.fn(),
    })

    render(<PaymentStatus />)

    expect(dispatch).toHaveBeenCalledWith(cartClear())
    expect(screen.getByText(/Payment successful/)).toBeVisible()
    expect(screen.getByText('✅')).toHaveAttribute('aria-hidden', 'true')

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByText(/Sikeres fizetés/)).toBeVisible()
    expect(screen.getByText('✅')).toHaveAttribute('aria-hidden', 'true')
    expect(
      screen.getByRole('button', { name: 'Vissza a boltba' }),
    ).toBeVisible()
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('offers a back to cart action after a declined payment', async () => {
    const status: PaymentStatusState = {
      type: 'requires_payment_method',
    }
    vi.mocked(usePaymentStatus).mockReturnValue({ status, retry: vi.fn() })

    render(<PaymentStatus />)
    expect(screen.getByText('💳')).toHaveAttribute('aria-hidden', 'true')
    expect(formatPaymentStatus('requires_payment_method')).toMatch(/^💳 /)
    await userEvent.click(screen.getByRole('button', { name: 'Back to Cart' }))

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function))
    expect(navigate).toHaveBeenCalledWith('/cart', { replace: true })
  })

  it('clears a successful payment once during Strict Mode effect replay', () => {
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'succeeded' },
      retry: vi.fn(),
    })
    render(
      <StrictMode>
        <PaymentStatus />
      </StrictMode>,
    )

    expect(dispatch).toHaveBeenCalledWith(cartClear())
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('handles each new successful payment while retaining the result after session cleanup', () => {
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'succeeded' },
      retry: vi.fn(),
    })
    const { rerender } = render(<PaymentStatus />)
    expect(dispatch).toHaveBeenCalledTimes(1)

    vi.mocked(useAppSelector).mockReturnValue(undefined)
    rerender(<PaymentStatus />)
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Payment successful/)).toBeVisible()

    vi.mocked(useAppSelector).mockReturnValue({
      paymentId: 'pi_next',
      paymentToken: 'next-secret',
      amount: 2400,
    })
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'checking' },
      retry: vi.fn(),
    })
    rerender(<PaymentStatus />)
    expect(dispatch).toHaveBeenCalledTimes(1)

    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'requires_capture' },
      retry: vi.fn(),
    })
    rerender(<PaymentStatus />)
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(screen.getByText(/Payment successful/)).toBeVisible()
    expect(screen.getByText('🔒')).toHaveAttribute('aria-hidden', 'true')
    expect(formatPaymentStatus('requires_capture')).toMatch(/^🔒 /)
  })

  it('leaves a canceled checkout for the shop without clearing the cart', async () => {
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'canceled' },
      retry: vi.fn(),
    })
    render(<PaymentStatus />)
    await userEvent.click(screen.getByRole('button', { name: 'Back to Shop' }))

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function))
    expect(navigate.mock.calls[0]?.[0]).toBe('/')
  })

  it('translates the required action and return-to-checkout button in Hungarian', async () => {
    await i18n.changeLanguage('hu')
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { type: 'requires_action' },
      retry: vi.fn(),
    })
    render(<PaymentStatus />)

    expect(
      screen.getByText(/végezze el a szükséges hitelesítést/),
    ).toBeVisible()
    expect(screen.getByText('🔐')).toHaveAttribute('aria-hidden', 'true')
    expect(formatPaymentStatus('requires_action')).toMatch(/^🔐 /)
    await userEvent.click(
      screen.getByRole('button', { name: 'Vissza a fizetéshez' }),
    )

    expect(navigate).toHaveBeenCalledWith('/checkout', { replace: true })
    expect(dispatch).not.toHaveBeenCalled()
  })

  it.each<{
    status: PaymentStatusState
    english: RegExp
    hungarian: RegExp
    emoji: string
  }>([
    {
      status: { type: 'retry', attempt: 2, maxAttempts: 3 },
      english: /retrying payment status \(2\/3\)/,
      hungarian: /állapotának ismételt ellenőrzése \(2\/3\)/,
      emoji: '🔄',
    },
    {
      status: { type: 'timeout', timeoutSeconds: 30 },
      english: /longer than expected \(30s\)/,
      hungarian: /a vártnál tovább tart \(30 mp\)/,
      emoji: '⏱️',
    },
    {
      status: { type: 'failure', details: '' },
      english: /retrieve payment status: Unknown error/,
      hungarian: /állapota nem kérdezhető le: Ismeretlen hiba/,
      emoji: '⚠️',
    },
  ])(
    'updates $status.type messages when the language changes',
    async ({ status, english, hungarian, emoji }) => {
      vi.mocked(usePaymentStatus).mockReturnValue({
        status,
        retry: vi.fn(),
      })
      render(<PaymentStatus />)
      expect(screen.getByText(english)).toBeVisible()
      expect(screen.getByText(emoji)).toHaveAttribute('aria-hidden', 'true')

      await act(async () => {
        await i18n.changeLanguage('hu')
      })

      expect(screen.getByText(hungarian)).toBeVisible()
      expect(screen.getByText(emoji)).toHaveAttribute('aria-hidden', 'true')
    },
  )
})
