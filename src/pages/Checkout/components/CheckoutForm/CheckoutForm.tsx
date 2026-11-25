import { useEffect, useRef, useState } from 'react'
import { Trans } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes/route'
import { usePaymentTermsQuery } from '@/store/api/paymentsApi'
import { userSelector } from '@/store/selectors'
import { cancelCheckout } from '@/store/thunks/checkout'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useLanguage } from '@/hooks/useLanguage'
import { usePaymentSubmit } from '@/hooks/usePaymentSubmit'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import { calculatePriceCents } from '@/helpers/pricing'
import { defaultCurrency } from '@/constants/defaultValues'
import type { ApiError, StripePaymentElementOptions } from '@/types'
import { SpinnerIcon } from '@/assets/svg'
import { CheckoutButton } from '../../Checkout.style'

const paymentElementOptions: StripePaymentElementOptions = {
  layout: 'accordion',
  business: {
    name: 'Bookshop',
  },
  fields: {
    billingDetails: {
      email: 'never',
    },
  },
}

export function CheckoutForm() {
  const { t, language, formatAmount } = useLanguage()
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const payment = useAppSelector((state) => state.payment.payment)
  const [linkEmail, setLinkEmail] = useState('')
  const [cancelError, setCancelError] = useState<
    ApiError | { message: string } | null
  >(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [acceptedTermsKey, setAcceptedTermsKey] = useState<string | null>(null)
  const {
    currentData: review,
    isFetching: isTermsLoading,
    isError: hasTermsError,
    refetch: refetchTerms,
  } = usePaymentTermsQuery(payment?.paymentId ?? '', {
    skip: !payment?.paymentId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  const terms = hasTermsError || isTermsLoading ? null : (review?.terms ?? null)
  const termsKey = terms
    ? JSON.stringify([payment?.paymentId, terms.version, language])
    : null
  const termsAccepted = termsKey !== null && acceptedTermsKey === termsKey
  const receiptEmail = (userData?.email ?? linkEmail).trim()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const lifecycleRef = useRef<{ active: boolean } | null>(null)

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    return () => {
      lifecycle.active = false
    }
  }, [])

  const { handleSubmit, canRetry, error, clearError, isLoading } =
    usePaymentSubmit({
      email: receiptEmail,
      paymentId: payment?.paymentId ?? '',
      terms,
      termsAccepted,
    })

  if (!payment) {
    return null
  }

  const paymentId = payment.paymentId

  const amount = formatAmount(payment.amount / 100)
  const currency = review?.order.currency ?? defaultCurrency
  const orderButtonLabel = t(
    canRetry ? 'terms.retryButton' : 'terms.orderButton',
    {
      amount,
      currency,
    },
  )
  const isPaymentDisabled =
    isLoading || isCanceling || !stripe || !elements || !termsAccepted

  const handleCancel = async () => {
    const lifecycle = lifecycleRef.current

    if (!lifecycle?.active || isCanceling || isLoading) {
      return
    }

    setCancelError(null)

    setIsCanceling(true)

    try {
      await dispatch(
        cancelCheckout(paymentId, () => {
          if (lifecycle.active) {
            void navigate(`/${ROUTE.CART}`, { replace: true })
          }
        }),
      )
    } catch (error) {
      if (!lifecycle.active) {
        return
      }

      setCancelError(
        getApiError(error) ?? { message: getErrorMessage(error, '') },
      )
    } finally {
      if (lifecycle.active) {
        setIsCanceling(false)
      }
    }
  }

  return (
    <form
      className="stripe-form"
      id="payment-form"
      onSubmit={(e) => {
        setCancelError(null)
        void handleSubmit(e)
      }}>
      {!userData?.email && (
        <LinkAuthenticationElement
          options={{ defaultValues: { email: linkEmail } }}
          onChange={(e) => {
            setLinkEmail(e.value.email)
            clearError()
            setCancelError(null)
          }}
        />
      )}
      <PaymentElement
        id="payment-element"
        options={paymentElementOptions}
        onChange={() => {
          clearError()
          setCancelError(null)
        }}
      />
      {review && (
        <section
          className="checkout-review"
          lang={language}
          aria-label={t('checkout.summary')}>
          <h3>{t('checkout.summary')}</h3>
          <ul>
            {review.order.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.title}
                  {item.author ? ` — ${item.author}` : ''} × {item.quantity}
                </span>
                <span>
                  {formatAmount(
                    calculatePriceCents(
                      item.price,
                      item.discount,
                      item.quantity,
                    ) / 100,
                  )}{' '}
                  {currency}
                </span>
              </li>
            ))}
          </ul>
          <p>{t('checkout.total', { amount, currency })}</p>
        </section>
      )}
      <div className="checkout-terms" lang={language}>
        {terms ? (
          <div className="checkout-terms-acceptance">
            <input
              id="checkout-terms-accepted"
              name="termsAccepted"
              aria-labelledby="checkout-terms-label"
              type="checkbox"
              required
              checked={termsAccepted}
              disabled={isLoading || isCanceling}
              onChange={(event) => {
                setAcceptedTermsKey(event.target.checked ? termsKey : null)
                clearError()
              }}
            />
            <span id="checkout-terms-label">
              <Trans
                i18nKey="terms.acceptance"
                components={{
                  label: <label htmlFor="checkout-terms-accepted" />,
                  termsLink: (
                    <a
                      href={terms.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t('terms.open')}
                    />
                  ),
                }}
              />
            </span>
          </div>
        ) : (
          <p role="status">
            {isTermsLoading && (
              <SpinnerIcon width={20} height={20} aria-hidden="true" />
            )}
            <span>
              {isTermsLoading
                ? t('terms.loading')
                : hasTermsError
                  ? t('terms.loadError')
                  : t('terms.unavailable')}
            </span>
          </p>
        )}
        {hasTermsError && (
          <CheckoutButton
            type="button"
            $color="neutral"
            $inverted
            onClick={() => void refetchTerms()}>
            {t('terms.reload')}
          </CheckoutButton>
        )}
      </div>
      <CheckoutButton
        type="submit"
        disabled={isPaymentDisabled}
        aria-busy={isLoading}
        lang={language}
        id="submit">
        {isLoading ? (
          <span className="payment-submit-status">
            <span className="spinner" aria-hidden="true" />
            {t('checkout.submittingPayment')}
          </span>
        ) : (
          orderButtonLabel
        )}
      </CheckoutButton>
      <CheckoutButton
        type="button"
        onClick={() => void handleCancel()}
        disabled={isLoading || isCanceling}
        $color="neutral"
        $inverted>
        <span>
          {isCanceling
            ? t('checkout.canceling')
            : cancelError
              ? t('checkout.cancelRetry')
              : t('checkout.cancel')}
        </span>
      </CheckoutButton>
      {cancelError && (
        <div id="cancel-message" role="alert" style={{ marginTop: '1rem' }}>
          {getErrorMessage(cancelError, t('checkout.cancelError'))}
        </div>
      )}
      {error && (
        <div id="payment-message" role="alert" className="error">
          {error}
        </div>
      )}
    </form>
  )
}
