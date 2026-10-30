import { MemoryRouter } from 'react-router'
import { i18n } from '@/i18n'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePaymentTermsQuery } from '@/store/api/termsApi'
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
vi.mock('@/store/api/termsApi', () => ({ usePaymentTermsQuery: vi.fn() }))

const review = {
  terms: {
    url: 'https://bookshop.test/terms-v1.pdf',
    version: 'v1',
    publishedAt: '2026-10-14T10:00:00Z',
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
const paymentLabel = /place order and pay|retry payment/i
const submitState = {
  handleSubmit: vi.fn(),
  canRetry: false,
  message: { text: null, type: 'neutral' as const },
  setMessage: vi.fn(),
  isLoading: false,
}

function mockReview(
  data: typeof review | { terms: null; order: typeof review.order } | undefined,
  state: { isFetching?: boolean; isError?: boolean } = {},
) {
  vi.mocked(usePaymentTermsQuery).mockReturnValue({
    currentData: data,
    isFetching: state.isFetching ?? false,
    isError: state.isError ?? false,
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
    expect(screen.getByRole('link')).toHaveTextContent(statements.en)

    await act(() => i18n.changeLanguage('hu'))

    expect(
      screen.getByRole('checkbox', { name: statements.hu }),
    ).not.toBeChecked()
    expect(screen.getByRole('link')).toHaveTextContent(statements.hu)
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
        name: /Megrendelés és fizetés/,
      }),
    ).toBeDisabled()
    expect(
      screen.getByRole('link', {
        name: 'Általános Szerződési Feltételeket (ÁSZF)',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toHaveAccessibleName(
      review.terms.statements.hu,
    )
    expect(screen.queryByText(/Közzétéve:/)).not.toBeInTheDocument()
  })

  it('starts unchecked and requires acceptance before payment', async () => {
    render(<CheckoutForm />, { wrapper: MemoryRouter })
    const checkbox = screen.getByRole('checkbox', {
      name: /I have read and accept/,
    })

    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeRequired()
    expect(checkbox).toHaveAccessibleName(review.terms.statements.en)
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
    const termsLink = screen.getByRole('link', { name: 'Terms and Conditions' })
    expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(termsLink).toHaveAttribute(
      'title',
      'Read Terms and Conditions (opens in a new tab)',
    )
    expect(screen.queryByText(/Published:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Version:/)).not.toBeInTheDocument()

    await userEvent.click(termsLink)

    expect(checkbox).not.toBeChecked()
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
    expect(
      screen.getByRole('link', { name: 'Terms and Conditions' }),
    ).toHaveAttribute('href', review.terms.url)
    expect(
      screen.getByRole('link', { name: 'Terms and Conditions' }),
    ).toHaveAttribute('target', '_blank')
    expect(
      screen.getByRole('region', { name: 'Order summary' }),
    ).toHaveTextContent('Ordered book')
    expect(
      screen.getByRole('button', { name: paymentLabel }),
    ).toHaveTextContent('12.00 EUR')

    await userEvent.click(screen.getByText('I have read and accept the'))
    expect(screen.getByRole('button', { name: paymentLabel })).toBeEnabled()
    expect(usePaymentSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ termsAccepted: true, terms: review.terms }),
    )

    await userEvent.click(termsLink)

    expect(checkbox).toBeChecked()
  })

  it('uses one payment button for retries and disables it when acceptance is removed', async () => {
    vi.mocked(usePaymentSubmit).mockReturnValue({
      ...submitState,
      canRetry: true,
      message: { text: 'Connection failed', type: 'error' },
    })
    render(<CheckoutForm />, { wrapper: MemoryRouter })
    const checkbox = screen.getByRole('checkbox')
    expect(screen.getAllByRole('button', { name: paymentLabel })).toHaveLength(
      1,
    )
    expect(
      screen.getByRole('button', { name: /^Retry payment/ }),
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: /^Place order/ }),
    ).not.toBeInTheDocument()

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
    mockReview(review, { isFetching: true })
    rerender(<CheckoutForm />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading terms and conditions',
    )

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
    expect(
      screen.getByRole('link', { name: 'Terms and Conditions' }),
    ).toHaveAttribute('href', 'https://bookshop.test/terms-v2.pdf')
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
      screen.getByRole('link', { name: 'Terms and Conditions' }),
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

  it('shows the loading state while terms are first being retrieved', () => {
    mockReview(undefined, { isFetching: true })
    render(<CheckoutForm />, { wrapper: MemoryRouter })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading terms and conditions',
    )
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
  })

  it('shows terms loading during a refresh and preserves acceptance for the same version', async () => {
    vi.mocked(usePaymentSubmit).mockReturnValue({
      ...submitState,
      canRetry: true,
    })
    const { rerender } = render(<CheckoutForm />, { wrapper: MemoryRouter })
    await userEvent.click(screen.getByRole('checkbox'))

    mockReview(review, { isFetching: true })
    rerender(<CheckoutForm />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading terms and conditions',
    )
    expect(
      screen.getByRole('button', { name: /^Retry payment/ }),
    ).toHaveAttribute('aria-busy', 'false')
    expect(
      screen.getByRole('button', { name: /^Retry payment/ }),
    ).toHaveTextContent('Retry payment')
    for (const button of screen.getAllByRole('button', {
      name: paymentLabel,
    })) {
      expect(button).toBeDisabled()
    }
    expect(usePaymentSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        terms: null,
        termsAccepted: false,
      }),
    )

    mockReview(review)
    rerender(<CheckoutForm />)

    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(
      screen.getByRole('button', { name: /^Retry payment/ }),
    ).toHaveAttribute('aria-busy', 'false')
    for (const button of screen.getAllByRole('button', {
      name: paymentLabel,
    })) {
      expect(button).toBeEnabled()
    }
  })

  it('blocks payment if refreshing terms fails despite cached acceptance', async () => {
    const { rerender } = render(<CheckoutForm />, { wrapper: MemoryRouter })
    await userEvent.click(screen.getByRole('checkbox'))

    mockReview(review, { isError: true })
    rerender(<CheckoutForm />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: paymentLabel })).toBeDisabled()
    expect(usePaymentSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        terms: null,
        termsAccepted: false,
      }),
    )
  })
})
