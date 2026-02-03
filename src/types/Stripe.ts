import type {
  AddressParam,
  PaymentIntent,
  StripeElementsOptions as StripeElementsOptionsType,
  StripeError as StripeErrorType,
  StripePaymentElementOptions as StripePaymentElementOptionsType,
} from '@stripe/stripe-js'

export type PaymentIntentStatus = PaymentIntent.Status
export type PaymentIntentShipping = PaymentIntent.Shipping
export type StripeAddress = AddressParam
export type StripeElementsOptions = StripeElementsOptionsType
export type StripePaymentElementOptions = StripePaymentElementOptionsType
export type StripeError = StripeErrorType
