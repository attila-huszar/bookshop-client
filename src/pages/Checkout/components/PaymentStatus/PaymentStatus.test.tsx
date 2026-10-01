import { useNavigate } from 'react-router'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartClear, paymentSessionReset } from '@/store'
import {
  useAppDispatch,
  useAppSelector,
  useMessages,
  usePaymentStatus,
} from '@/hooks'
import type { PaymentStatusState } from '@/hooks/usePaymentStatus'
import { PaymentStatus } from './PaymentStatus'

vi.mock('@/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
  useMessages: vi.fn(),
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
      payment: { paymentId: 'pi_test', paymentToken: 'secret', amount: 1200 },
    })
    vi.mocked(useMessages).mockReturnValue({
      getCheckoutSubmitMessages: () => ({
        notReady: 'Not ready',
        missingEmail: 'Missing email',
        submitFailed: 'Submit failed',
      }),
      getCheckoutStatusMessages: () => ({
        checking: 'Checking payment status',
        paymentReceived: 'Payment received',
        intent: () => 'Payment failed',
        retry: () => 'Retrying payment',
        fetchFailed: () => 'Could not retrieve payment',
        timeout: () => 'Payment timed out',
      }),
      getStripePaymentErrorMessage: () => 'Payment failed',
      getUnknownErrorDetails: () => 'Unknown error',
    })
    vi.mocked(useNavigate).mockReturnValue(navigate)
  })

  it('clears the active payment session after success', () => {
    vi.mocked(usePaymentStatus).mockReturnValue({
      status: { intent: 'succeeded', messageOverride: null },
      retry: vi.fn(),
    })

    render(<PaymentStatus />)

    expect(dispatch).toHaveBeenCalledWith(cartClear())
    expect(dispatch).toHaveBeenCalledWith(paymentSessionReset())
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
})
