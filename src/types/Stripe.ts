import type {
  AddressParam,
  PaymentIntent,
  PaymentIntentConfirmParams,
} from '@stripe/stripe-js'

export type {
  PaymentIntent,
  StripeAddressElementOptions,
  StripeElementsOptions,
  StripeError,
  StripeErrorType,
  StripePaymentElementOptions,
} from '@stripe/stripe-js'

export type PaymentIntentStatus = PaymentIntent.Status
export type PaymentIntentShipping = PaymentIntent.Shipping
export type ConfirmPaymentShipping = PaymentIntentConfirmParams.Shipping
export type StripeAddress = AddressParam
