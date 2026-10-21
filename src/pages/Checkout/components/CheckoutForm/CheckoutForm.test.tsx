import { MemoryRouter } from 'react-router'
import { i18n } from '@/i18n'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePaymentTermsQuery } from '@/store/api/bookshopApi'
import { userSelector } from '@/store/selectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePaymentSubmit } from '@/hooks/usePaymentSubmit'
import { CheckoutForm } from './CheckoutForm'

vi.mock('@stripe/react-stripe-js', () => ({
  useElements: vi.fn(),
  useStripe: vi.fn(),
  PaymentElement: () => <div>Payment details</div>,
  LinkAuthenticationElement: () => <div>Guest email</div>,
}))
vi.mock('@/hooks/redux', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('@/hooks/usePaymentSubmit', () => ({
  usePaymentSubmit: vi.fn(),
}))
vi.mock('@/store/api/bookshopApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/bookshopApi')>()),
  usePaymentTermsQuery: vi.fn(),
}))

const review = {
  terms: {
    url: 'https://bookshop.test/terms-v1.pdf',
    version: 'v1',
    statements: {
      en: 'I have read and accept the Terms and Conditions.',
      hu: 'Elolvastam és elfogadom az Általános Szerződési Feltételeket (ÁSZF).',
    },
  },
  order: {
    total: 12,
    currency: 'EUR',
    items: [
      {
        id: 1,
        title: 'Ordered book',
        author: 'Author',
        imgUrl: '',
        price: 12,
        discount: 0,
        quantity: 1,
      },
    ],
  },
}
const paymentLabel = /order with obligation to pay/i
const submitState = {
  handleSubmit: vi.fn(),
  retryPayment: vi.fn(),
  canRetry: false,
  message: { text: null, type: 'neutral' as const },
  setMessage: vi.fn(),
  isLoading: false,
}

function mockReview(
  data: typeof review | { terms: null; order: typeof review.order },
) {
  vi.mocked(usePaymentTermsQuery).mockReturnValue({
    data,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useStripe).mockReturnValue({} as ReturnType<typeof useStripe>)
  vi.mocked(useElements).mockReturnValue({} as ReturnType<typeof useElements>)
  vi.mocked(useAppSelector).mockImplementation((selector) => {
    if (selector === userSelector) {
      return { userData: { email: 'reader@example.com' } }
    }

    return { paymentId: 'pi_test', paymentToken: 'test', amount: 1200 }
  })
  vi.mocked(useAppDispatch).mockReturnValue(vi.fn())
  vi.mocked(usePaymentSubmit).mockReturnValue(submitState)
  mockReview(review)
})

describe('Checkout terms checkbox', () => {
  it('uses the declaration returned for the published version in both languages', async () => {
    const statements = {
      en: 'Version-specific English declaration',
      hu: 'A verzióhoz tartozó magyar nyilatkozat',
    }
    mockReview({ ...review, terms: { ...review.terms, statements } })
    render(<CheckoutForm />, { wrapper: MemoryRouter })

    expect(
      screen.getByRole('checkbox', { name: statements.en }),
    ).not.toBeChecked()

    await act(() => i18n.changeLanguage('hu'))

    expect(
      screen.getByRole('checkbox', { name: statements.hu }),
    ).not.toBeChecked()
  })

  it('switches to Hungarian and requires acceptance of the displayed language', async () => {
    render(<CheckoutForm />, { wrapper: MemoryRouter })
    await userEvent.click(screen.getByRole('checkbox'))

    await act(() => i18n.changeLanguage('hu'))

    expect(
      screen.getByRole('checkbox', { name: /Elolvastam és elfogadom/ }),
    ).not.toBeChecked()
    expect(
      screen.getByRole('button', {
        name: /Fizetési kötelezettséggel járó megrendelés/,
      }),
    ).toBeDisabled()
    expect(
      screen.getByRole('link', { name: /ÁSZF megnyitása/ }),
    ).toBeInTheDocument()
  })

  it('starts unchecked and requires acceptance before payment', async () => {
    render(<CheckoutForm />, { wrapper: MemoryRouter })
    const checkbox = screen.getByRole('checkbox', {
      name: /I have read and accept/,
    })

    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeRequired()
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
    expect(
      screen.getByRole('link', { name: /Read Terms and Conditions/ }),
    ).toHaveAttribute('href', review.terms.url)
    expect(
      screen.getByRole('link', { name: /Read Terms and Conditions/ }),
    ).toHaveAttribute('target', '_blank')
    expect(
      screen.getByRole('region', { name: 'Order summary' }),
    ).toHaveTextContent('Ordered book')
    expect(
      screen.getByRole('button', { name: paymentLabel }),
    ).toHaveTextContent('12.00 EUR')

    await userEvent.click(checkbox)
    expect(screen.getByRole('button', { name: paymentLabel })).toBeEnabled()
    expect(usePaymentSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ termsAccepted: true, terms: review.terms }),
    )
  })

  it('disables both payment buttons again when acceptance is removed', async () => {
    vi.mocked(usePaymentSubmit).mockReturnValue({
      ...submitState,
      canRetry: true,
      message: { text: 'Connection failed', type: 'error' },
    })
    render(<CheckoutForm />, { wrapper: MemoryRouter })
    const checkbox = screen.getByRole('checkbox')

    await userEvent.click(checkbox)
    for (const button of screen.getAllByRole('button', {
      name: paymentLabel,
    })) {
      expect(button).toBeEnabled()
    }
    await userEvent.click(checkbox)
    for (const button of screen.getAllByRole('button', {
      name: paymentLabel,
    })) {
      expect(button).toBeDisabled()
    }
  })

  it('requires fresh acceptance when the displayed document changes', async () => {
    const { rerender } = render(<CheckoutForm />, { wrapper: MemoryRouter })
    await userEvent.click(screen.getByRole('checkbox'))
    mockReview({
      ...review,
      terms: {
        ...review.terms,
        url: 'https://bookshop.test/terms-v2.pdf',
        version: 'v2',
      },
    })
    rerender(<CheckoutForm />)

    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
  })

  it('preserves acceptance when only the document URL changes', async () => {
    const { rerender } = render(<CheckoutForm />, { wrapper: MemoryRouter })
    await userEvent.click(screen.getByRole('checkbox'))
    const url = 'https://new-bookshop.test/terms-v1.pdf'
    mockReview({ ...review, terms: { ...review.terms, url } })
    rerender(<CheckoutForm />)

    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('button', { name: paymentLabel })).toBeEnabled()
    expect(
      screen.getByRole('link', { name: /Read Terms and Conditions/ }),
    ).toHaveAttribute('href', url)
  })

  it('keeps payment disabled when terms have not been configured', () => {
    mockReview({ ...review, terms: null })
    render(<CheckoutForm />, { wrapper: MemoryRouter })

    expect(screen.getByRole('status')).toHaveTextContent(
      'terms and conditions are unavailable',
    )
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
  })

  it('keeps payment disabled while refreshed terms are loading', () => {
    vi.mocked(usePaymentTermsQuery).mockReturnValue({
      data: review,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    })
    render(<CheckoutForm />, { wrapper: MemoryRouter })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading terms and conditions',
    )
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
  })
})
