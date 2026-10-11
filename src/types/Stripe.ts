import type { PaymentIntent } from '@stripe/stripe-js'

export type {
  Address as StripeAddress,
  PaymentIntent,
  StripeAddressElementOptions,
  StripeElementsOptions,
  StripeError,
  StripeErrorType,
  StripePaymentElementOptions,
} from '@stripe/stripe-js'

export type PaymentIntentStatus = PaymentIntent.Status
export type PaymentIntentShipping = PaymentIntent.Shipping
