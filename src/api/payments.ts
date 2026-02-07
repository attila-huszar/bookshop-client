import { baseRequest, PATH } from '.'
import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentSession,
} from '@/types'

export const getPaymentIntent = async (
  paymentId: string,
): Promise<PaymentIntentResponse> => {
  const response = await baseRequest.get<PaymentIntentResponse>(
    `${PATH.payments}/${paymentId}`,
  )
  return await response.json()
}

export const postPaymentIntent = async (
  payment: PaymentIntentRequest,
): Promise<PaymentSession> => {
  const response = await baseRequest.post<PaymentSession>(PATH.payments, {
    json: payment,
  })
  return await response.json()
}

export const deletePaymentIntent = async (
  paymentId: string,
): Promise<PaymentIntentResponse> => {
  const response = await baseRequest.delete<PaymentIntentResponse>(
    `${PATH.payments}/${paymentId}`,
  )
  return await response.json()
}
