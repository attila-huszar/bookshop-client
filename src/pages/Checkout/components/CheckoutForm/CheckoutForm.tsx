import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { shopLanguage } from '@/i18n'
import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes/route'
import { usePaymentTermsQuery } from '@/store/api/bookshopApi'
import { userSelector } from '@/store/selectors'
import { paymentSessionReset } from '@/store/slices/payment'
import { paymentCancel } from '@/store/thunks/payment'
import { toast } from '@/components/AppToaster'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePaymentSubmit } from '@/hooks/usePaymentSubmit'
import { formatAmount } from '@/helpers/checkout'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import { defaultCurrency } from '@/constants/defaultValues'
import type { ApiError, StripePaymentElementOptions } from '@/types'

export function CheckoutForm() {
  const { t, i18n } = useTranslation()
  const language = shopLanguage(i18n.resolvedLanguage)
  const stripe = useStripe()
  const elements = useElements()
  const { userData } = useAppSelector(userSelector)
  const payment = useAppSelector((state) => state.payment.payment)
  const [linkEmail, setLinkEmail] = useState('')
  const [cancelError, setCancelError] = useState<string | ApiError | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [acceptedTermsKey, setAcceptedTermsKey] = useState<string | null>(null)
  const {
    data: review,
    isFetching: isTermsLoading,
    isError: hasTermsError,
    refetch: refetchTerms,
  } = usePaymentTermsQuery(payment?.paymentId ?? '', {
    skip: !payment?.paymentId,
    refetchOnMountOrArgChange: true,
  })
  const terms = hasTermsError || isTermsLoading ? null : (review?.terms ?? null)
  const termsKey = terms
    ? JSON.stringify([payment?.paymentId, terms.version, language])
    : null
  const termsAccepted = termsKey !== null && acceptedTermsKey === termsKey
  const receiptEmail = (userData?.email ?? linkEmail).trim()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    handleSubmit,
    retryPayment,
    canRetry,
    message,
    setMessage,
    isLoading,
  } = usePaymentSubmit({
    email: receiptEmail,
    paymentId: payment?.paymentId ?? '',
    terms,
    termsAccepted,
  })

  if (!payment) {
    return (
      <div>
        <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {t('checkout.missingOrder')}
        </p>
        <button
          type="button"
          onClick={() => void navigate(`/${ROUTE.CART}`, { replace: true })}>
          <span>{t('common.actions.backToCart')}</span>
        </button>
      </div>
    )
  }

  const paymentId = payment.paymentId

  const orderForm = {
    num: paymentId.slice(-6).toUpperCase(),
    amount: formatAmount(payment.amount / 100, i18n.resolvedLanguage),
  }
  const currency = review?.order.currency ?? defaultCurrency
  const isPaymentDisabled =
    isLoading || isCanceling || !stripe || !elements || !termsAccepted

  const handleCancel = async () => {
    setCancelError(null)

    if (!paymentId) {
      const errorMessage = t('checkout.missingPaymentId')
      setCancelError('checkout.missingPaymentId')
      toast.error(errorMessage, { id: 'checkout-cancel-error' })
      return
    }

    setIsCanceling(true)

    try {
      await dispatch(paymentCancel({ paymentId })).unwrap()
      dispatch(paymentSessionReset())
      void navigate(`/${ROUTE.CART}`, { replace: true })
    } catch (error) {
      const errorMessage = getErrorMessage(error, t('checkout.cancelError'))

      setCancelError(getApiError(error) ?? errorMessage)
      toast.error(errorMessage, { id: 'checkout-cancel-error' })
    } finally {
      setIsCanceling(false)
    }
  }

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

  return (
    <form
      className="stripe-form"
      id="payment-form"
      onSubmit={(e) => {
        setCancelError(null)
        void handleSubmit(e)
      }}>
      <div>
        <p>{t('checkout.order', { number: orderForm.num })}</p>
        <span>
          {orderForm.amount} {currency}
        </span>
      </div>
      {!userData?.email && (
        <LinkAuthenticationElement
          options={{ defaultValues: { email: linkEmail } }}
          onChange={(e) => {
            setLinkEmail(e.value.email)
            setMessage({ text: null, type: 'neutral' })
            setCancelError(null)
          }}
        />
      )}
      <PaymentElement
        id="payment-element"
        options={paymentElementOptions}
        onChange={() => {
          setMessage({ text: null, type: 'neutral' })
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
                    item.price * (1 - item.discount / 100) * item.quantity,
                    i18n.resolvedLanguage,
                  )}{' '}
                  {currency}
                </span>
              </li>
            ))}
          </ul>
          <p>{t('checkout.total', { amount: orderForm.amount, currency })}</p>
        </section>
      )}
      <div className="checkout-terms" lang={language}>
        {terms ? (
          <>
            <label htmlFor="checkout-terms-accepted">
              <input
                id="checkout-terms-accepted"
                name="termsAccepted"
                type="checkbox"
                required
                checked={termsAccepted}
                disabled={isLoading || isCanceling}
                onChange={(event) => {
                  setAcceptedTermsKey(event.target.checked ? termsKey : null)
                  setMessage({ text: null, type: 'neutral' })
                }}
              />
              <span>{terms.statements[language]}</span>
            </label>
            <p>
              <a href={terms.url} target="_blank" rel="noopener noreferrer">
                {t('terms.open')}
              </a>{' '}
              · {t('terms.version', { version: terms.version })}
            </p>
          </>
        ) : (
          <p role="status">
            {isTermsLoading
              ? t('terms.loading')
              : hasTermsError
                ? t('terms.loadError')
                : t('terms.unavailable')}
          </p>
        )}
        {hasTermsError && (
          <button type="button" onClick={() => void refetchTerms()}>
            {t('terms.reload')}
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPaymentDisabled}
        lang={language}
        id="submit">
        <span>
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            t('terms.orderButton', { amount: orderForm.amount, currency })
          )}
        </span>
      </button>
      {canRetry && message && (
        <button
          type="button"
          onClick={() => void retryPayment()}
          disabled={isPaymentDisabled}
          lang={language}
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <span>
            {t('terms.retryButton', { amount: orderForm.amount, currency })}
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={() => void handleCancel()}
        disabled={isLoading || isCanceling}
        style={{ backgroundColor: 'var(--color-on-surface-variant)' }}>
        <span>
          {isCanceling
            ? t('checkout.canceling')
            : cancelError
              ? t('checkout.cancelRetry')
              : t('checkout.cancel')}
        </span>
      </button>
      {cancelError && (
        <div id="cancel-message" style={{ marginTop: '1rem' }}>
          {typeof cancelError === 'string'
            ? t(cancelError, { defaultValue: cancelError })
            : getErrorMessage(cancelError, t('checkout.cancelError'))}
        </div>
      )}
      {message.text && (
        <div
          id="payment-message"
          role={message.type === 'error' ? 'alert' : 'status'}
          className={message.type === 'error' ? 'error' : undefined}>
          {message.text}
        </div>
      )}
    </form>
  )
}
