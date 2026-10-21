import { useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartClear } from '@/store/slices/cart'
import { paymentSessionReset } from '@/store/slices/payment'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import type {
  PaymentStatusMessageOverride,
  PaymentStatusState,
} from '@/hooks/usePaymentStatus'
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
      status: { intent: 'succeeded', messageOverride: null },
      retry: vi.fn(),
    })

    render(<PaymentStatus />)

    expect(dispatch).toHaveBeenCalledWith(cartClear())
    expect(dispatch).toHaveBeenCalledWith(paymentSessionReset())
    expect(screen.getByText(/Payment successful/)).toBeVisible()

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByText(/Sikeres fizetés/)).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Vissza a boltba' }),
    ).toBeVisible()
    expect(dispatch).toHaveBeenCalledTimes(2)
  })

  it('offers a back to cart action after a declined payment', async () => {
    const status: PaymentStatusState = {
      intent: 'requires_payment_method',
      messageOverride: null,
    }
    vi.mocked(usePaymentStatus).mockReturnValue({ status, retry: vi.fn() })

    render(<PaymentStatus />)
    await userEvent.click(screen.getByRole('button', { name: 'Back to Cart' }))

    expect(dispatch).toHaveBeenCalledWith(paymentSessionReset())
    expect(navigate).toHaveBeenCalledWith('/cart', { replace: true })
  })

  it('translates the required action and return-to-checkout button in Hungarian', async () => {
    await i18n.changeLanguage('hu')
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { intent: 'requires_action', messageOverride: null },
      retry: vi.fn(),
    })
    render(<PaymentStatus />)

    expect(
      screen.getByText(/végezze el a szükséges hitelesítést/),
    ).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Vissza a fizetéshez' }),
    )

    expect(navigate).toHaveBeenCalledWith('/checkout', { replace: true })
  })

  it.each<{
    override: PaymentStatusMessageOverride
    english: RegExp
    hungarian: RegExp
  }>([
    {
      override: { type: 'retry', attempt: 2, maxRetries: 3 },
      english: /retrying payment status \(2\/3\)/,
      hungarian: /állapotának ismételt ellenőrzése \(2\/3\)/,
    },
    {
      override: { type: 'timeout', timeoutSeconds: 30 },
      english: /longer than expected \(30s\)/,
      hungarian: /a vártnál tovább tart \(30 mp\)/,
    },
    {
      override: { type: 'failure', details: '' },
      english: /retrieve payment status: Unknown error/,
      hungarian: /állapota nem kérdezhető le: Ismeretlen hiba/,
    },
  ])(
    'updates $override.type messages when the language changes',
    async ({ override, english, hungarian }) => {
      vi.mocked(usePaymentStatus).mockReturnValue({
        status: { intent: null, messageOverride: override },
        retry: vi.fn(),
      })
      render(<PaymentStatus />)
      expect(screen.getByText(english)).toBeVisible()

      await act(async () => {
        await i18n.changeLanguage('hu')
      })

      expect(screen.getByText(hungarian)).toBeVisible()
    },
  )
})
