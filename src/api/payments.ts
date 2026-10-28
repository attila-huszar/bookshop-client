import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentSession,
} from '@/types'
import { authRequest } from './authRequest'
import { PATH } from './path'

export const getPaymentIntent = (paymentId: string, signal?: AbortSignal) =>
  authRequest
    .get(`${PATH.payments}/${paymentId}`, { credentials: 'include', signal })
    .json<PaymentIntentResponse>()

export const postPaymentIntent = (
  payment: PaymentIntentRequest,
  clientIdempotencyKey: string,
) =>
  authRequest
    .post(PATH.payments, {
      json: payment,
      credentials: 'include',
      headers: {
        'Idempotency-Key': clientIdempotencyKey,
      },
    })
    .json<PaymentSession>()

export const deletePaymentIntent = (paymentId: string) =>
  authRequest
    .delete(`${PATH.payments}/${paymentId}`, { credentials: 'include' })
    .json<PaymentIntentResponse>()
