export const checkoutQueryParams = {
  paymentIntent: 'payment_intent',
  paymentToken: 'payment_intent_client_secret',
  redirectStatus: 'redirect_status',
} as const

export const paymentSessionUnavailableCode = 'session_unavailable'
