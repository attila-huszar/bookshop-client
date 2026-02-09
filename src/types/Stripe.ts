import type {
  PaymentIntent,
  PaymentIntentConfirmParams,
  StripeAddressElementChangeEvent,
  StripeElementsOptions as StripeElementsOptionsType,
  StripeError as StripeErrorType,
  StripePaymentElementOptions as StripePaymentElementOptionsType,
} from '@stripe/stripe-js'

export type PaymentIntentStatus = PaymentIntent.Status
export type PaymentIntentShipping = NonNullable<
  PaymentIntentConfirmParams['shipping']
>
export type StripeAddress = PaymentIntentShipping['address']
export type StripeAddressChange = StripeAddressElementChangeEvent
export type StripeElementsOptions = StripeElementsOptionsType
export type StripePaymentElementOptions = StripePaymentElementOptionsType
export type StripeError = StripeErrorType
